/**
 * Enhanced Toast Utilities
 * Provides better feedback for async operations
 */

import toast from 'react-hot-toast';

/**
 * Show a promise-based toast with loading, success, and error states
 * @param promise - The promise to track
 * @param messages - Messages for different states
 * @returns The original promise
 */
export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
): Promise<T> => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: data => (typeof messages.success === 'function' ? messages.success(data) : messages.success),
    error: error => (typeof messages.error === 'function' ? messages.error(error) : messages.error),
  });
};

/**
 * Multi-step operation with progress updates
 * @param steps - Array of step objects with label and action
 * @param options - Configuration options
 * @returns Resolves with array of results
 */
export const toastMultiStep = async <T>(
  steps: Array<{
    label: string;
    action: () => Promise<T>;
  }>,
  options: {
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<T[]> => {
  if (!steps || steps.length === 0) {
    throw new Error('No steps provided');
  }

  const results: T[] = [];
  let toastId: string | undefined;

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) {
        continue;
      }

      const message = `${step.label}... (${i + 1}/${steps.length})`;

      if (i === 0) {
        toastId = toast.loading(message);
      } else {
        toast.loading(message, { id: toastId });
      }

      const result = await step.action();
      results.push(result);

      // Show brief success for each step except the last
      if (i < steps.length - 1 && step) {
        const nextStep = steps[i + 1];
        if (nextStep) {
          toast.loading(`✓ ${step.label} complete. ${nextStep.label}... (${i + 2}/${steps.length})`, { id: toastId });
        }
      }
    }

    const successMsg = options.successMessage || 'All operations completed successfully!';
    toast.success(successMsg, { id: toastId });
    return results;
  } catch (error) {
    const errorMsg = options.errorMessage || (error instanceof Error ? error.message : 'Operation failed');
    toast.error(errorMsg, { id: toastId });
    throw error;
  }
};

/**
 * Show a loading toast that can be updated and dismissed manually
 * @param message - Initial message
 * @returns Controller object with update and dismiss methods
 */
export const toastLoading = (message: string) => {
  const id = toast.loading(message);

  return {
    id,
    update: (newMessage: string) => {
      toast.loading(newMessage, { id });
    },
    success: (successMessage: string) => {
      toast.success(successMessage, { id });
    },
    error: (errorMessage: string) => {
      toast.error(errorMessage, { id });
    },
    dismiss: () => {
      toast.dismiss(id);
    },
  };
};

/**
 * Show a toast with retry functionality
 * @param action - The action to retry
 * @param options - Configuration options
 * @returns Resolves when action succeeds
 */
export const toastWithRetry = async <T>(
  action: () => Promise<T>,
  options: {
    message: string;
    maxRetries?: number;
  }
): Promise<T> => {
  const maxRetries = options.maxRetries || 3;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt === 0) {
        return await toastPromise(action(), {
          loading: options.message,
          success: 'Operation completed successfully!',
          error: error => `${error.message}${attempt < maxRetries - 1 ? '. Retrying...' : '. Failed after retries.'}`,
        });
      } else {
        return await action();
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries - 1) {
        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};
