<?php

return [
    /*
    |--------------------------------------------------------------------------
    | reCAPTCHA Configuration
    |--------------------------------------------------------------------------
    |
    | Google reCAPTCHA v2 configuration for spam protection
    |
    */

    'site_key' => env('RECAPTCHA_SITE_KEY', ''),
    'secret_key' => env('RECAPTCHA_SECRET_KEY', ''),

    // Enable/disable reCAPTCHA (useful for development)
    'enabled' => env('RECAPTCHA_ENABLED', true),

    // Minimum score for v3 (not used in v2)
    'score_threshold' => 0.5,
];
