import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload(); // Simple reset strategy
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-150px)] text-center p-4 bg-surface border border-error/50">
          <h1 className="text-2xl font-bold text-error mb-2">Something went wrong.</h1>
          <p className="text-text-muted mb-4">An unexpected error occurred. Please try refreshing the application.</p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-accent text-on-accent hover:shadow-glow-accent"
          >
            Refresh Page
          </button>
          {this.state.error && (
            <details className="mt-4 text-left text-xs text-text-muted bg-bg-secondary p-2">
                <summary>Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}