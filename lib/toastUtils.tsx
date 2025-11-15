/**
 * Enhanced Toast Utilities
 * Provides better feedback for async operations
 */

import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import React from 'react';

/**
 * Show a promise-based toast with loading, success, and error states
 * @param promise - The promise to track
 * @param messages - Messages for different states
 * @returns The original promise
 */
export const toastPromise = <T,>(
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
export const toastMultiStep = async <T,>(
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
export const toastWithRetry = async <T,>(
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

/**
 * Toast action button options
 */
interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

/**
 * Enhanced toast options with action buttons and rich content
 */
interface EnhancedToastOptions {
  duration?: number;
  action?: ToastAction;
  rich?: boolean;
  position?: 'top-center' | 'bottom-right';
}

/**
 * Custom toast component with icon, progress, and action button
 */
const ToastContent = ({
  icon,
  message,
  action,
  duration,
  onDismiss,
  type,
}: {
  icon: React.ReactNode;
  message: string | React.ReactNode;
  action?: ToastAction;
  duration: number;
  onDismiss: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
}) => {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (duration === Infinity) {
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  const typeColors = {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  };

  return (
    <div className="flex items-start gap-3 p-3 min-w-[320px]">
      <div className={`flex-shrink-0 ${typeColors[type]}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[hsl(var(--text-primary))] break-words">{message}</div>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onDismiss();
            }}
            className={`mt-2 px-3 py-1 text-xs font-semibold rounded transition-colors ${
              action.variant === 'primary'
                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] hover:opacity-90'
                : 'bg-[hsl(var(--surface-secondary))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-tertiary))]'
            }`}
          >
            {action.label}
          </button>
        )}
        {duration !== Infinity && (
          <div className="mt-2 h-1 bg-[hsl(var(--surface-secondary))] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-50 ${
                type === 'success'
                  ? 'bg-success'
                  : type === 'error'
                    ? 'bg-error'
                    : type === 'warning'
                      ? 'bg-warning'
                      : 'bg-info'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors p-1 -mt-1 -mr-1"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * Show a success toast with icon
 */
export const toastSuccess = (message: string | React.ReactNode, options?: EnhancedToastOptions) => {
  const id = toast.custom(
    t => (
      <ToastContent
        icon={<CheckCircle className="h-5 w-5" />}
        message={message}
        action={options?.action}
        duration={options?.duration ?? 4000}
        onDismiss={() => toast.dismiss(t.id)}
        type="success"
      />
    ),
    {
      duration: options?.duration ?? 4000,
      position: options?.position ?? 'top-center',
    }
  );
  return id;
};

/**
 * Show an error toast with icon
 */
export const toastError = (message: string | React.ReactNode, options?: EnhancedToastOptions) => {
  const id = toast.custom(
    t => (
      <ToastContent
        icon={<XCircle className="h-5 w-5" />}
        message={message}
        action={options?.action}
        duration={options?.duration ?? 5000}
        onDismiss={() => toast.dismiss(t.id)}
        type="error"
      />
    ),
    {
      duration: options?.duration ?? 5000,
      position: options?.position ?? 'top-center',
    }
  );
  return id;
};

/**
 * Show a warning toast with icon
 */
export const toastWarning = (message: string | React.ReactNode, options?: EnhancedToastOptions) => {
  const id = toast.custom(
    t => (
      <ToastContent
        icon={<AlertTriangle className="h-5 w-5" />}
        message={message}
        action={options?.action}
        duration={options?.duration ?? 4000}
        onDismiss={() => toast.dismiss(t.id)}
        type="warning"
      />
    ),
    {
      duration: options?.duration ?? 4000,
      position: options?.position ?? 'top-center',
    }
  );
  return id;
};

/**
 * Show an info toast with icon
 */
export const toastInfo = (message: string | React.ReactNode, options?: EnhancedToastOptions) => {
  const id = toast.custom(
    t => (
      <ToastContent
        icon={<Info className="h-5 w-5" />}
        message={message}
        action={options?.action}
        duration={options?.duration ?? 3000}
        onDismiss={() => toast.dismiss(t.id)}
        type="info"
      />
    ),
    {
      duration: options?.duration ?? 3000,
      position: options?.position ?? 'bottom-right',
    }
  );
  return id;
};
