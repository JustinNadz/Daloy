<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'display_name',
        'bio',
        'avatar',
        'cover_photo',
        'location',
        'website',
        'birthdate',
        'privacy',
        'is_verified',
        'is_active',
        'is_suspended',
        'suspended_until',
        'suspension_reason',
        'last_active_at',
        'terms_accepted_at',
        'deletion_requested_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_enabled_at',
        'oauth_provider',
        'oauth_id',
        'oauth_token',
        'oauth_refresh_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birthdate' => 'date',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'is_suspended' => 'boolean',
        'suspended_until' => 'datetime',
        'last_active_at' => 'datetime',
    ];

    /**
     * Send the email verification notification.
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification);
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    /**
     * Get the user's avatar URL.
     */
    public function getAvatarUrlAttribute(): string
    {
        return $this->avatar
            ? asset('storage/' . $this->avatar)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->display_name) . '&background=random';
    }

    /**
     * Get the user's cover photo URL.
     */
    public function getCoverPhotoUrlAttribute(): ?string
    {
        return $this->cover_photo ? asset('storage/' . $this->cover_photo) : null;
    }

    // Relationships

    /**
     * Posts created by the user.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Users that this user follows.
     */
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Users that follow this user.
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Get accepted followers.
     */
    public function acceptedFollowers()
    {
        return $this->followers()->wherePivot('status', 'accepted');
    }

    /**
     * Get accepted following.
     */
    public function acceptedFollowing()
    {
        return $this->following()->wherePivot('status', 'accepted');
    }

    /**
     * Pending follow requests.
     */
    public function pendingFollowRequests()
    {
        return $this->followers()->wherePivot('status', 'pending');
    }

    /**
     * Reactions by the user.
     */
    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    /**
     * Bookmarks by the user.
     */
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Bookmark collections.
     */
    public function bookmarkCollections()
    {
        return $this->hasMany(BookmarkCollection::class);
    }

    /**
     * Notifications received by the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Conversations the user participates in.
     */
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot(['role', 'is_muted', 'last_read_at', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    /**
     * Messages sent by the user.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Groups the user is a member of.
     */
    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_members')
            ->withPivot(['role', 'status', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Groups created by the user.
     */
    public function ownedGroups()
    {
        return $this->hasMany(Group::class, 'created_by');
    }

    /**
     * Users blocked by this user.
     */
    public function blockedUsers()
    {
        return $this->belongsToMany(User::class, 'blocks', 'blocker_id', 'blocked_id')
            ->withTimestamps();
    }

    /**
     * Users who blocked this user.
     */
    public function blockedBy()
    {
        return $this->belongsToMany(User::class, 'blocks', 'blocked_id', 'blocker_id')
            ->withTimestamps();
    }

    /**
     * Users muted by this user.
     */
    public function mutedUsers()
    {
        return $this->belongsToMany(User::class, 'mutes', 'user_id', 'muted_user_id')
            ->withPivot('expires_at')
            ->withTimestamps();
    }

    /**
     * Reports filed by the user.
     */
    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Media uploaded by the user.
     */
    public function media()
    {
        return $this->hasMany(Media::class);
    }

    // Helper methods

    /**
     * Check if this user follows another user.
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    /**
     * Check if this user is followed by another user.
     */
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * Check if this user has blocked another user.
     */
    public function hasBlocked(User $user): bool
    {
        return $this->blockedUsers()->where('blocked_id', $user->id)->exists();
    }

    /**
     * Check if this user is blocked by another user.
     */
    public function isBlockedBy(User $user): bool
    {
        return $this->blockedBy()->where('blocker_id', $user->id)->exists();
    }

    /**
     * Check if this user has muted another user.
     */
    public function hasMuted(User $user): bool
    {
        return $this->mutedUsers()
            ->where('muted_user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Get follower count.
     */
    public function getFollowersCountAttribute(): int
    {
        return $this->acceptedFollowers()->count();
    }

    /**
     * Get following count.
     */
    public function getFollowingCountAttribute(): int
    {
        return $this->acceptedFollowing()->count();
    }

    /**
     * Get posts count.
     */
    public function getPostsCountAttribute(): int
    {
        return $this->posts()->count();
    }
}
