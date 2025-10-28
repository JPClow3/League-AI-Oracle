/**
 * Error Handling Utilities
 * Provides consistent error message extraction
 */

/**
 * Extract a user-friendly error message from various error types
 * @param error - Error object or unknown type
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is an abort error
 * @param error - Error to check
 * @returns true if error is AbortError
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * Check if error is a network error
 * @param error - Error to check
 * @returns true if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const networkErrorMessages = [
    'Failed to fetch',
    'Network request failed',
    'NetworkError',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ];

  return networkErrorMessages.some(msg => error.message.includes(msg));
}

/**
 * Format API error response
 * @param response - Fetch Response object
 * @returns Formatted error message
 */
export async function formatApiError(response: Response): Promise<string> {
  try {
    const errorBody = await response.json();
    return errorBody.error || errorBody.message || `API Error: ${response.statusText}`;
  } catch {
    return `API Error: ${response.statusText}`;
  }
}
