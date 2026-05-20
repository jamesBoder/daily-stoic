import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4">
          <div className="max-w-md w-full bg-surface rounded-lg shadow-lg p-8 text-center">
            <div className="text-danger text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-fg mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-fg-muted mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-left text-xs bg-surface-hi p-4 rounded mb-4 overflow-auto">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-accent text-accent-text rounded-lg hover:bg-accent-dark transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-surface-hi text-fg rounded-lg hover:brightness-95 transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
