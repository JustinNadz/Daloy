<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Image Optimization Configuration
    |--------------------------------------------------------------------------
    */

    // Enable image optimization
    'enabled' => env('IMAGE_OPTIMIZATION_ENABLED', true),

    // Storage driver (local, s3, etc.)
    'storage' => env('IMAGE_STORAGE_DRIVER', 'public'),

    // Image variants/sizes to generate
    'sizes' => [
        'thumbnail' => [
            'width' => 150,
            'height' => 150,
            'fit' => 'crop', // crop, contain, fill
        ],
        'small' => [
            'width' => 300,
            'height' => 300,
            'fit' => 'contain',
        ],
        'medium' => [
            'width' => 600,
            'height' => 600,
            'fit' => 'contain',
        ],
        'large' => [
            'width' => 1200,
            'height' => 1200,
            'fit' => 'contain',
        ],
    ],

    // Image quality settings
    'quality' => [
        'jpeg' => 85,
        'webp' => 80,
        'png' => 90,
    ],

    // Enable WebP conversion for modern browsers
    'webp_enabled' => env('IMAGE_WEBP_ENABLED', true),

    // Max upload size (in MB)
    'max_size' => env('IMAGE_MAX_SIZE', 10),

    // Allowed mime types
    'allowed_types' => [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ],

    // Store original images
    'keep_original' => true,

    // Dynamic resize on demand
    'dynamic_resize' => env('IMAGE_DYNAMIC_RESIZE', true),
];
