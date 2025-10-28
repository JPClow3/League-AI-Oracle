import React, { Component, ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Feature-level error boundary for individual components.
 * Provides a graceful fallback UI and recovery mechanism.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName } = this.props;
    console.error(`Error in ${componentName || 'component'}:`, error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          component: componentName,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { componentName } = this.props;
      const { error } = this.state;

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-surface border-2 border-error/20 rounded-lg min-h-[300px]">
          <AlertTriangle className="w-16 h-16 text-error mb-4" />
          <h2 className="text-2xl font-bold text-error mb-2">
            {componentName ? `${componentName} Error` : 'Something went wrong'}
          </h2>
          <p className="text-text-secondary mb-4 text-center max-w-md">
            {error?.message || 'An unexpected error occurred in this component.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="secondary">
              Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-text-muted hover:text-text-primary">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 p-4 bg-surface-inset rounded text-xs overflow-auto max-h-64">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
    };
  }
}

