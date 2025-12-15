import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md max-w-2xl w-full">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <div className="text-sm overflow-auto max-h-[300px] bg-gray-100 dark:bg-zinc-900 p-4 rounded">
              <p className="font-mono">{this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Additional information:
              </p>
              <ul className="list-disc list-inside text-sm mt-2 text-gray-600 dark:text-gray-400">
                <li>Current URL: {window.location.href}</li>
                <li>User Agent: {navigator.userAgent}</li>
                <li>Date/Time: {new Date().toLocaleString()}</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 