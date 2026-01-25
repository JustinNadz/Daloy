<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'mediable_type',
        'mediable_id',
        'type',
        'filename',
        'original_filename',
        'path',
        'url',
        'thumbnail_url',
        'mime_type',
        'size',
        'width',
        'height',
        'duration',
        'alt_text',
        'order',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'duration' => 'integer',
        'order' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mediable()
    {
        return $this->morphTo();
    }

    public function getFullUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }

    public function getFullThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_url ? asset('storage/' . $this->thumbnail_url) : null;
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }
}
