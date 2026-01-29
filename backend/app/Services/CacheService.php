<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheService
{
    protected $config;

    public function __construct()
    {
        $this->config = config('redis-cache');
    }

    /**
     * Get from cache or execute callback
     */
    public function remember($key, $callback, $ttl = null, $prefix = 'api')
    {
        if (!$this->config['enabled']) {
            return $callback();
        }

        $fullKey = $this->getFullKey($key, $prefix);
        $ttl = $ttl ?? $this->config['ttl']['medium'];

        return Cache::remember($fullKey, $ttl, $callback);
    }

    /**
     * Cache with tags for easy invalidation
     */
    public function rememberWithTags($tags, $key, $callback, $ttl = null)
    {
        if (!$this->config['enabled']) {
            return $callback();
        }

        $ttl = $ttl ?? $this->config['ttl']['medium'];

        return Cache::tags($tags)->remember($key, $ttl, $callback);
    }

    /**
     * Put data in cache
     */
    public function put($key, $value, $ttl = null, $prefix = 'api')
    {
        if (!$this->config['enabled']) {
            return;
        }

        $fullKey = $this->getFullKey($key, $prefix);
        $ttl = $ttl ?? $this->config['ttl']['medium'];

        Cache::put($fullKey, $value, $ttl);
    }

    /**
     * Get from cache
     */
    public function get($key, $default = null, $prefix = 'api')
    {
        $fullKey = $this->getFullKey($key, $prefix);
        return Cache::get($fullKey, $default);
    }

    /**
     * Invalidate cache by key
     */
    public function forget($key, $prefix = 'api')
    {
        $fullKey = $this->getFullKey($key, $prefix);
        Cache::forget($fullKey);
    }

    /**
     * Invalidate cache by tag
     */
    public function flushTag($tag)
    {
        Cache::tags([$tag])->flush();
    }

    /**
     * Invalidate multiple tags
     */
    public function flushTags(array $tags)
    {
        Cache::tags($tags)->flush();
    }

    /**
     * Clear all cache
     */
    public function flush()
    {
        Cache::flush();
    }

    /**
     * Check if key exists in cache
     */
    public function has($key, $prefix = 'api')
    {
        $fullKey = $this->getFullKey($key, $prefix);
        return Cache::has($fullKey);
    }

    /**
     * Increment cache value
     */
    public function increment($key, $value = 1, $prefix = 'api')
    {
        $fullKey = $this->getFullKey($key, $prefix);
        return Cache::increment($fullKey, $value);
    }

    /**
     * Decrement cache value
     */
    public function decrement($key, $value = 1, $prefix = 'api')
    {
        $fullKey = $this->getFullKey($key, $prefix);
        return Cache::decrement($fullKey, $value);
    }

    /**
     * Cache user-specific data
     */
    public function cacheForUser($userId, $key, $callback, $ttl = null)
    {
        $userKey = "user:{$userId}:{$key}";
        return $this->remember($userKey, $callback, $ttl, 'user');
    }

    /**
     * Invalidate all cache for a user
     */
    public function forgetUser($userId)
    {
        $pattern = $this->config['prefixes']['user'] . "user:{$userId}:*";
        $this->forgetPattern($pattern);
    }

    /**
     * Cache query results
     */
    public function cacheQuery($key, $callback, $ttl = null)
    {
        return $this->remember($key, $callback, $ttl, 'query');
    }

    /**
     * Get cache statistics
     */
    public function getStats()
    {
        try {
            $redis = Redis::connection();
            $info = $redis->info();

            return [
                'used_memory' => $info['used_memory_human'] ?? 'N/A',
                'connected_clients' => $info['connected_clients'] ?? 0,
                'total_commands_processed' => $info['total_commands_processed'] ?? 0,
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                'hit_rate' => $this->calculateHitRate($info),
            ];
        } catch (\Exception $e) {
            return ['error' => 'Redis not available'];
        }
    }

    /**
     * Calculate cache hit rate
     */
    protected function calculateHitRate($info)
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;

        if ($total === 0) {
            return 0;
        }

        return round(($hits / $total) * 100, 2);
    }

    /**
     * Forget cache by pattern
     */
    protected function forgetPattern($pattern)
    {
        try {
            $redis = Redis::connection();
            $keys = $redis->keys($pattern);

            if (!empty($keys)) {
                $redis->del($keys);
            }
        } catch (\Exception $e) {
            // Redis not available
        }
    }

    /**
     * Get full cache key with prefix
     */
    protected function getFullKey($key, $prefix)
    {
        $prefixValue = $this->config['prefixes'][$prefix] ?? $prefix . ':';
        return $prefixValue . $key;
    }

    /**
     * Warm up cache with popular content
     */
    public function warmCache()
    {
        if (!$this->config['warming']['enabled']) {
            return;
        }

        // Example: Cache trending posts
        $this->remember('trending_posts', function () {
            // Logic to get trending posts
            return [];
        }, $this->config['warming']['items']['trending_posts']);

        // Add more warming strategies as needed
    }
}
