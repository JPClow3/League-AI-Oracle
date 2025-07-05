import { SharePayload } from '../types';

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper function to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function compress(data: string): Promise<ArrayBuffer> {
    const stream = new Blob([data], { type: 'text/plain' }).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    return await new Response(compressedStream).arrayBuffer();
}

async function decompress(data: ArrayBuffer): Promise<string> {
    const stream = new Blob([data]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    return await new Response(decompressedStream).text();
}

export const shareService = {
    encodeForUrl: async (payload: SharePayload): Promise<string> => {
        // The DraftState contains a Set, which doesn't stringify. Convert it to an array.
        const serializablePayload = {
            ...payload,
            draftState: {
                ...payload.draftState,
                pickedChampions: Array.from(payload.draftState.pickedChampions)
            }
        };
        const jsonString = JSON.stringify(serializablePayload);
        const compressed = await compress(jsonString);
        const base64 = arrayBufferToBase64(compressed);
        return encodeURIComponent(base64);
    },

    decodeFromUrl: async (encoded: string): Promise<SharePayload> => {
        const base64 = decodeURIComponent(encoded);
        const compressed = base64ToArrayBuffer(base64);
        const jsonString = await decompress(compressed);
        const parsed = JSON.parse(jsonString);
        // Rehydrate the Set from the array
        parsed.draftState.pickedChampions = new Set(parsed.draftState.pickedChampions);
        return parsed;
    }
};
