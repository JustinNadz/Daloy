<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookmarkCollection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class, 'collection_id');
    }

    public function posts()
    {
        return $this->hasManyThrough(Post::class, Bookmark::class, 'collection_id', 'id', 'id', 'post_id');
    }

    public function getBookmarksCountAttribute(): int
    {
        return $this->bookmarks()->count();
    }
}
