import * as Sentry from '@sentry/react';

// Initialize Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,

        // Environment
        environment: import.meta.env.MODE,

        // Release version (update this with each deployment)
        release: import.meta.env.VITE_APP_VERSION || 'daloy@1.0.0',

        // Performance Monitoring (simplified to avoid compatibility issues)
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Session replay for debugging
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Sample rate for performance monitoring (0.0 to 1.0)
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

        // Sample rate for session replay (0.0 to 1.0)
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,

        // Sample rate for replays on error (0.0 to 1.0)
        replaysOnErrorSampleRate: 1.0,

        // Before send callback (filter sensitive data)
        beforeSend(event, hint) {
            // Filter out sensitive data
            if (event.request) {
                // Remove auth headers
                if (event.request.headers) {
                    delete event.request.headers.Authorization;
                    delete event.request.headers.Cookie;
                }

                // Remove sensitive query params
                if (event.request.query_string) {
                    event.request.query_string = event.request.query_string
                        .replace(/token=[^&]+/g, 'token=[FILTERED]')
                        .replace(/password=[^&]+/g, 'password=[FILTERED]');
                }
            }

            // Filter out password fields from extras
            if (event.extra) {
                Object.keys(event.extra).forEach(key => {
                    if (key.toLowerCase().includes('password')) {
                        event.extra[key] = '[FILTERED]';
                    }
                });
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'canvas.contentDocument',
            // Network errors that are expected
            'Network request failed',
            'NetworkError',
            // React dev tools
            '__REACT_DEVTOOLS',
        ],

        // Don't send errors in development
        enabled: import.meta.env.PROD,
    });
}

// Export utility functions (work even if Sentry not initialized)
export function setSentryUser(user) {
    if (window.Sentry && import.meta.env.VITE_SENTRY_DSN) {
        if (user) {
            Sentry.setUser({
                id: user.id,
                username: user.username,
                email: user.email,
            });
        } else {
            Sentry.setUser(null);
        }
    }
}

// Set custom context
export function setSentryContext(name, context) {
    if (window.Sentry && import.meta.env.VITE_SENTRY_DSN) {
        Sentry.setContext(name, context);
    }
}

// Manual error capture
export function captureError(error, context = {}) {
    if (window.Sentry && import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureException(error, {
            contexts: context,
        });
    }
}

// Manual message capture
export function captureMessage(message, level = 'info') {
    if (window.Sentry && import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureMessage(message, level);
    }
}

export default Sentry;
