<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Redis Caching Configuration
    |--------------------------------------------------------------------------
    */

    // Enable Redis caching
    'enabled' => env('REDIS_CACHE_ENABLED', true),

    // Default cache lifetime in seconds
    'ttl' => [
        'short' => 60,        // 1 minute
        'medium' => 300,      // 5 minutes
        'long' => 3600,       // 1 hour
        'very_long' => 86400, // 24 hours
    ],

    // Cache prefixes by type
    'prefixes' => [
        'query' => 'db:',
        'api' => 'api:',
        'session' => 'session:',
        'user' => 'user:',
        'post' => 'post:',
        'media' => 'media:',
    ],

    // Cache tags for easy invalidation
    'tags' => [
        'users' => 'users',
        'posts' => 'posts',
        'comments' => 'comments',
        'media' => 'media',
        'stats' => 'stats',
    ],

    // Cache warming - popular content
    'warming' => [
        'enabled' => env('CACHE_WARMING_ENABLED', true),
        'items' => [
            'trending_posts' => 300,    // Refresh every 5 min
            'user_dashboard' => 600,    // Refresh every 10 min
            'popular_media' => 900,     // Refresh every 15 min
        ],
    ],

    // Real-time invalidation patterns
    'invalidation' => [
        'on_create' => true,   // Invalidate when new records created
        'on_update' => true,   // Invalidate when records updated
        'on_delete' => true,   // Invalidate when records deleted
    ],
];
