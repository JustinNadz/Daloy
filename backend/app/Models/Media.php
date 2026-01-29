<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'media';

    protected $fillable = [
        'user_id',
        'type',
        'filename',
        'original_path',
        'mime_type',
        'size',
        'variants',
        'dimensions',
        'duration',
        'is_optimized',
        'optimization_progress',
        'status',
        'cdn_url',
        'is_public',
        'metadata',
        'views',
    ];

    protected $casts = [
        'variants' => 'array',
        'dimensions' => 'array',
        'metadata' => 'array',
        'is_optimized' => 'boolean',
        'is_public' => 'boolean',
        'optimization_progress' => 'integer',
        'size' => 'integer',
        'duration' => 'integer',
        'views' => 'integer',
    ];

    /**
     * Get the user that owns the media
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get URL for a specific variant
     */
    public function getVariantUrl($size = 'medium')
    {
        if ($this->cdn_url) {
            return $this->cdn_url . '/' . ($this->variants[$size] ?? $this->original_path);
        }

        return asset('storage/' . ($this->variants[$size] ?? $this->original_path));
    }

    /**
     * Get the original file URL
     */
    public function getUrlAttribute()
    {
        if ($this->cdn_url) {
            return $this->cdn_url . '/' . $this->original_path;
        }

        return asset('storage/' . $this->original_path);
    }

    /**
     * Increment views counter
     */
    public function incrementViews()
    {
        $this->increment('views');
    }

    /**
     * Check if media is an image
     */
    public function isImage()
    {
        return $this->type === 'image';
    }

    /**
     * Check if media is a video
     */
    public function isVideo()
    {
        return $this->type === 'video';
    }

    /**
     * Scope for images only
     */
    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    /**
     * Scope for videos only
     */
    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    /**
     * Scope for ready media
     */
    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }
}
