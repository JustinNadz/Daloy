<?php

return [

    'dsn' => env('SENTRY_LARAVEL_DSN'),

    // Capture release information
    'release' => env('SENTRY_RELEASE'),

    // Environment (production, staging, development)
    'environment' => env('APP_ENV', 'production'),

    // Sample rate (0.0 to 1.0) for performance monitoring
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.2),

    // Send default PII (personally identifiable information)
    'send_default_pii' => false,

    // Breadcrumbs & Context
    'breadcrumbs' => [
        // Capture SQL queries
        'sql_queries' => true,

        // Capture SQL bindings
        'sql_bindings' => true,

        // Capture Laravel logs
        'logs' => true,

        // Capture cache events
        'cache' => true,
    ],

    // Integration options
    'integrations' => [
        // Capture unhandled promise rejections
        new \Sentry\Integration\RequestIntegration(),
    ],

    // Before send callback (filter sensitive data)
    'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
        // Filter out sensitive data from request
        if ($event->getRequest()) {
            $request = $event->getRequest();

            // Remove sensitive headers
            $headers = $request->getHeaders() ?? [];
            unset($headers['Authorization']);
            unset($headers['Cookie']);

            // Remove passwords from POST data
            $data = $request->getData() ?? [];
            if (isset($data['password'])) {
                $data['password'] = '[FILTERED]';
            }
            if (isset($data['password_confirmation'])) {
                $data['password_confirmation'] = '[FILTERED]';
            }
        }

        return $event;
    },

    // Ignored exceptions
    'ignore_exceptions' => [
        Illuminate\Auth\AuthenticationException::class,
        Illuminate\Validation\ValidationException::class,
        Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
    ],

    // Ignored transaction names
    'ignore_transactions' => [
        // Health checks
        'GET /health',
        'GET /api/health',
    ],
];
