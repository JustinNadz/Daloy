<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Group extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'avatar',
        'cover_photo',
        'privacy',
        'created_by',
        'rules',
        'is_active',
    ];

    protected $casts = [
        'rules' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($group) {
            $group->slug = $group->slug ?? Str::slug($group->name) . '-' . Str::random(6);
        });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot(['role', 'status', 'joined_at'])
            ->withTimestamps();
    }

    public function approvedMembers()
    {
        return $this->members()->wherePivot('status', 'approved');
    }

    public function pendingMembers()
    {
        return $this->members()->wherePivot('status', 'pending');
    }

    public function admins()
    {
        return $this->members()->wherePivotIn('role', ['owner', 'admin']);
    }

    public function moderators()
    {
        return $this->members()->wherePivot('role', 'moderator');
    }

    public function posts()
    {
        return $this->belongsToMany(Post::class, 'group_posts')
            ->withPivot(['is_pinned', 'is_announcement'])
            ->withTimestamps();
    }

    public function invitations()
    {
        return $this->hasMany(GroupInvitation::class);
    }

    public function reports()
    {
        return $this->morphMany(Report::class, 'reportable');
    }

    public function isPublic(): bool
    {
        return $this->privacy === 'public';
    }

    public function isPrivate(): bool
    {
        return $this->privacy === 'private';
    }

    public function isSecret(): bool
    {
        return $this->privacy === 'secret';
    }

    public function isMember(User $user): bool
    {
        return $this->members()
            ->where('users.id', $user->id)
            ->wherePivot('status', 'approved')
            ->exists();
    }

    public function isAdmin(User $user): bool
    {
        return $this->members()
            ->where('users.id', $user->id)
            ->wherePivotIn('role', ['owner', 'admin'])
            ->exists();
    }

    public function isModerator(User $user): bool
    {
        return $this->members()
            ->where('users.id', $user->id)
            ->wherePivotIn('role', ['owner', 'admin', 'moderator'])
            ->exists();
    }

    public function isOwner(User $user): bool
    {
        return $this->created_by === $user->id;
    }

    public function getMemberRole(User $user): ?string
    {
        $member = $this->members()->where('users.id', $user->id)->first();
        return $member?->pivot?->role;
    }

    public function updateCounts(): void
    {
        $this->update([
            'members_count' => $this->approvedMembers()->count(),
            'posts_count' => $this->posts()->count(),
        ]);
    }
}
