
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            <div className="p-8 bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-lg shadow-xl text-center max-w-md">
                <h1 className="text-4xl font-display text-rose-600 dark:text-rose-300">An Error Occurred</h1>
                <p className="mt-2 mb-4">
                    Something went wrong within the application. Please try reloading the page.
                </p>
                <details className="text-left text-xs bg-black/10 p-2 rounded-md mb-4">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all">
                        {this.state.error?.toString()}
                    </pre>
                </details>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors"
                >
                    Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
