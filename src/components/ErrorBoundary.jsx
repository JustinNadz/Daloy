import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to Sentry
        if (window.Sentry) {
            window.Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
            });
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Oops! Something went wrong
                            </h1>

                            {/* Message */}
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                We're sorry for the inconvenience. An unexpected error occurred and our team has been notified.
                            </p>

                            {/* Error details (development only) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                            <summary className="cursor-pointer font-semibold">
                                                Component Stack
                                            </summary>
                                            <pre className="mt-2 overflow-auto max-h-40">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={this.handleReset}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Try Again</span>
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    <span>Go to Home</span>
                                </button>
                            </div>

                            {/* Help text */}
                            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                If this problem persists, please contact support.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
