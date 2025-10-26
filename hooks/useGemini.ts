import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * A custom hook to manage data fetching from the Gemini API.
 * It encapsulates loading, error, and data states, and handles aborting requests.
 * @param fetcher An async function that takes an AbortSignal and other arguments, returning a promise with the data.
 * @param lazy If true, the fetch will not run on mount and must be triggered by calling `execute`.
 * @returns An object with the fetched data, loading state, error state, and an execute function to trigger the fetch.
 */
export function useGeminiData<T, TArgs extends any[]>(
  fetcher: (signal: AbortSignal, ...args: TArgs) => Promise<T>,
  lazy: boolean = false
) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(!lazy);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const execute = useCallback(async (...args: TArgs) => {
        // Abort any pending request before starting a new one.
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setError(null);
        // Do not clear previous data for a smoother UX while refetching
        // setData(null); 

        try {
            const result = await fetcher(controller.signal, ...args);
            if (!controller.signal.aborted) {
                setData(result);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                console.log("Gemini fetch aborted.");
                // If it was a user-initiated abort, we might not want to clear loading state
                // depending on UX. For now, we'll stop loading.
                setIsLoading(false);
                return;
            }
            if (!controller.signal.aborted) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [fetcher]);

    // Effect to run the fetcher on mount if not lazy and it takes no arguments.
    useEffect(() => {
        // The `as TArgs` cast is a safe assumption for non-lazy fetches that don't need initial args.
        if (!lazy) {
            execute(...([] as unknown as TArgs));
        }
        
        // Cleanup function to abort the request if the component unmounts.
        return () => {
            abortControllerRef.current?.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazy]);

    return { data, isLoading, error, execute };
}