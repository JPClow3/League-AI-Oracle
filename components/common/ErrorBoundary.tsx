import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  constructor(props: Props) {
    super(props);
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service (implement your logging service here)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry if available
    try {
      // Dynamic import to avoid issues if logger is not yet initialized
      import('../../lib/logger').then(({ logger }) => {
        logger.error(error, {
          component: 'ErrorBoundary',
          componentStack: errorInfo.componentStack,
        });
      }).catch(() => {
        // Fallback to console if logger fails
        if (import.meta.env.PROD) {
          console.error('Production Error:', {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
          });
        }
      });
    } catch {
      // Fallback to console
      if (import.meta.env.PROD) {
        console.error('Production Error:', {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }
    }
  }

  private handleReset(): void {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-150px)] text-center p-4 bg-surface border border-error/50">
          <h1 className="text-2xl font-bold text-error mb-2">Something went wrong</h1>
          <p className="text-text-muted mb-4">
            An unexpected error occurred. Please try refreshing the application.
          </p>
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-accent text-on-accent hover:shadow-glow-accent"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-surface-light text-text hover:bg-surface-lighter"
            >
              Reload Page
            </button>
          </div>
          {this.state.error && (
            <details className="mt-4 text-left text-xs text-text-muted bg-bg-secondary p-2 max-w-2xl">
              <summary className="cursor-pointer hover:text-text">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-60">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}