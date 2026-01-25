<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'content',
        'privacy',
        'parent_id',
        'original_post_id',
        'quoted_post_id',
        'is_repost',
        'is_pinned',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_repost' => 'boolean',
        'is_pinned' => 'boolean',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    // Relationships

    /**
     * The user who created the post.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Parent post (for comments/replies).
     */
    public function parent()
    {
        return $this->belongsTo(Post::class, 'parent_id');
    }

    /**
     * Child posts (comments/replies).
     */
    public function comments()
    {
        return $this->hasMany(Post::class, 'parent_id');
    }

    /**
     * Original post (for reposts).
     */
    public function originalPost()
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    /**
     * Reposts of this post.
     */
    public function reposts()
    {
        return $this->hasMany(Post::class, 'original_post_id');
    }

    /**
     * Quoted post (for quote tweets).
     */
    public function quotedPost()
    {
        return $this->belongsTo(Post::class, 'quoted_post_id');
    }

    /**
     * Quotes of this post.
     */
    public function quotes()
    {
        return $this->hasMany(Post::class, 'quoted_post_id');
    }

    /**
     * Media attached to the post.
     */
    public function media()
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('order');
    }

    /**
     * Reactions on the post.
     */
    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    /**
     * Hashtags in the post.
     */
    public function hashtags()
    {
        return $this->belongsToMany(Hashtag::class, 'hashtag_post')->withTimestamps();
    }

    /**
     * Mentions in the post.
     */
    public function mentions()
    {
        return $this->morphMany(Mention::class, 'mentionable');
    }

    /**
     * Users who bookmarked this post.
     */
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Reports on this post.
     */
    public function reports()
    {
        return $this->morphMany(Report::class, 'reportable');
    }

    /**
     * Notifications related to this post.
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    /**
     * Group this post belongs to (if any).
     */
    public function group()
    {
        return $this->hasOneThrough(
            Group::class,
            GroupPost::class,
            'post_id',
            'id',
            'id',
            'group_id'
        );
    }

    // Scopes

    /**
     * Scope for main posts (not comments).
     */
    public function scopeMainPosts($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope for public posts.
     */
    public function scopePublic($query)
    {
        return $query->where('privacy', 'public');
    }

    /**
     * Scope for posts visible to followers.
     */
    public function scopeForFollowers($query)
    {
        return $query->whereIn('privacy', ['public', 'followers']);
    }

    /**
     * Scope to exclude reposts.
     */
    public function scopeOriginal($query)
    {
        return $query->where('is_repost', false);
    }

    // Helper methods

    /**
     * Check if a user has reacted to this post.
     */
    public function hasReactedBy(User $user): bool
    {
        return $this->reactions()->where('user_id', $user->id)->exists();
    }

    /**
     * Get the reaction type by a user.
     */
    public function getReactionBy(User $user): ?Reaction
    {
        return $this->reactions()->where('user_id', $user->id)->first();
    }

    /**
     * Check if a user has bookmarked this post.
     */
    public function isBookmarkedBy(User $user): bool
    {
        return $this->bookmarks()->where('user_id', $user->id)->exists();
    }

    /**
     * Check if a user has reposted this post.
     */
    public function isRepostedBy(User $user): bool
    {
        return $this->reposts()->where('user_id', $user->id)->exists();
    }

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Update engagement counts.
     */
    public function updateCounts(): void
    {
        $this->update([
            'likes_count' => $this->reactions()->count(),
            'comments_count' => $this->comments()->count(),
            'reposts_count' => $this->reposts()->count(),
            'bookmarks_count' => $this->bookmarks()->count(),
        ]);
    }

    /**
     * Extract hashtags from content.
     */
    public function extractHashtags(): array
    {
        preg_match_all('/#(\w+)/u', $this->content, $matches);
        return array_unique($matches[1] ?? []);
    }

    /**
     * Extract mentions from content.
     */
    public function extractMentions(): array
    {
        preg_match_all('/@(\w+)/u', $this->content, $matches);
        return array_unique($matches[1] ?? []);
    }
}
