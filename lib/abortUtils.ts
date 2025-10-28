/**
 * Safe AbortController utilities
 * Prevents errors during cleanup and unmount scenarios
 */

/**
 * Safely abort an AbortController without throwing errors
 * @param controller - AbortController to abort
 * @param reason - Optional reason for aborting
 * @returns boolean - true if aborted successfully
 */
export const safeAbort = (
    controller: AbortController | null | undefined,
    reason?: string
): boolean => {
    if (!controller) {
        return false;
    }

    try {
        if (!controller.signal.aborted) {
            controller.abort(reason);
            return true;
        }
        return false;
    } catch (error) {
        // Ignore AbortError during cleanup - this is expected
        if (error instanceof DOMException && error.name === 'AbortError') {
            return false;
        }

        // Log unexpected errors
        console.error('Unexpected error during abort:', error);
        return false;
    }
};

/**
 * Create an AbortController with automatic cleanup
 * @param timeoutMs - Optional timeout in milliseconds
 * @returns Object with controller and cleanup function
 */
export const createAbortController = (timeoutMs?: number): {
    controller: AbortController;
    cleanup: () => void;
} => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    if (timeoutMs) {
        timeoutId = setTimeout(() => {
            safeAbort(controller, 'Timeout');
        }, timeoutMs);
    }

    const cleanup = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        safeAbort(controller, 'Cleanup');
    };

    return { controller, cleanup };
};

/**
 * Check if an AbortController's signal is aborted
 * @param controller - AbortController to check
 * @returns boolean - true if aborted
 */
export const isAborted = (
    controller: AbortController | null | undefined
): boolean => {
    return controller?.signal.aborted ?? false;
};

/**
 * Create an abort signal that times out after a specified duration
 * @param timeoutMs - Timeout in milliseconds
 * @returns AbortSignal that will abort after timeout
 */
export const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
    const controller = new AbortController();
    setTimeout(() => {
        safeAbort(controller, 'Timeout');
    }, timeoutMs);
    return controller.signal;
};

/**
 * Combine multiple abort signals into one
 * Any signal aborting will trigger the combined signal
 * @param signals - Array of AbortSignals to combine
 * @returns Combined AbortSignal
 */
export const combineAbortSignals = (...signals: AbortSignal[]): AbortSignal => {
    const controller = new AbortController();

    const onAbort = () => {
        safeAbort(controller, 'Parent signal aborted');
    };

    signals.forEach(signal => {
        if (signal.aborted) {
            safeAbort(controller, 'Initial signal already aborted');
        } else {
            signal.addEventListener('abort', onAbort, { once: true });
        }
    });

    return controller.signal;
};

/**
 * Hook-friendly abort controller manager
 * Use this in React components for safe cleanup
 */
export class AbortControllerManager {
    private controller: AbortController | null = null;

    /**
     * Get or create an abort controller
     */
    get(): AbortController {
        if (!this.controller || this.controller.signal.aborted) {
            this.controller = new AbortController();
        }
        return this.controller;
    }

    /**
     * Get the signal from the current controller
     */
    signal(): AbortSignal | undefined {
        return this.controller?.signal;
    }

    /**
     * Abort the current controller
     */
    abort(reason?: string): void {
        safeAbort(this.controller, reason);
    }

    /**
     * Check if currently aborted
     */
    isAborted(): boolean {
        return isAborted(this.controller);
    }

    /**
     * Reset (create new controller)
     */
    reset(): void {
        this.abort('Reset');
        this.controller = new AbortController();
    }

    /**
     * Cleanup (for use in useEffect cleanup)
     */
    cleanup(): void {
        this.abort('Cleanup');
        this.controller = null;
    }
}

