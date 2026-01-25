<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get user profile by username.
     */
    public function show(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $authUser = $request->user();

        $isFollowing = $authUser->isFollowing($user);
        $isFollowedBy = $user->isFollowing($authUser);
        $isBlocked = $authUser->hasBlocked($user);
        $isBlockedBy = $user->hasBlocked($authUser);

        if ($isBlockedBy) {
            return $this->error('You cannot view this profile', 403);
        }

        return $this->success([
            'user' => $this->formatUser($user, $authUser),
            'relationship' => [
                'is_following' => $isFollowing,
                'is_followed_by' => $isFollowedBy,
                'is_blocked' => $isBlocked,
                'follow_status' => $this->getFollowStatus($authUser, $user),
            ],
        ]);
    }

    /**
     * Search users.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:50'],
        ]);

        $query = $validated['q'];
        $authUser = $request->user();
        $blockedIds = $authUser->blockedUsers()->pluck('blocked_id')->toArray();
        $blockedByIds = $authUser->blockedBy()->pluck('blocker_id')->toArray();
        $excludeIds = array_merge($blockedIds, $blockedByIds, [$authUser->id]);

        $users = User::where(function ($q) use ($query) {
                $q->where('username', 'like', "%{$query}%")
                    ->orWhere('display_name', 'like', "%{$query}%");
            })
            ->whereNotIn('id', $excludeIds)
            ->where('is_active', true)
            ->limit(20)
            ->get();

        return $this->success([
            'users' => $users->map(fn ($user) => $this->formatUser($user, $authUser)),
        ]);
    }

    /**
     * Get user's followers.
     */
    public function followers(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $authUser = $request->user();

        // Check if we can view followers
        if ($user->privacy === 'private' && $user->id !== $authUser->id && !$authUser->isFollowing($user)) {
            return $this->error('You cannot view this user\'s followers', 403);
        }

        $followers = $user->acceptedFollowers()->paginate(20);

        return $this->paginated(
            $followers->through(fn ($follower) => $this->formatUser($follower, $authUser))
        );
    }

    /**
     * Get user's following.
     */
    public function following(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $authUser = $request->user();

        if ($user->privacy === 'private' && $user->id !== $authUser->id && !$authUser->isFollowing($user)) {
            return $this->error('You cannot view this user\'s following', 403);
        }

        $following = $user->acceptedFollowing()->paginate(20);

        return $this->paginated(
            $following->through(fn ($followed) => $this->formatUser($followed, $authUser))
        );
    }

    /**
     * Follow a user.
     */
    public function follow(Request $request, User $user)
    {
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return $this->error('You cannot follow yourself', 400);
        }

        if ($authUser->hasBlocked($user) || $user->hasBlocked($authUser)) {
            return $this->error('Cannot follow this user', 400);
        }

        $existingFollow = Follow::where('follower_id', $authUser->id)
            ->where('following_id', $user->id)
            ->first();

        if ($existingFollow) {
            if ($existingFollow->status === 'accepted') {
                return $this->error('You are already following this user', 400);
            }
            if ($existingFollow->status === 'pending') {
                return $this->error('Follow request already pending', 400);
            }
        }

        $status = $user->privacy === 'private' ? 'pending' : 'accepted';

        Follow::create([
            'follower_id' => $authUser->id,
            'following_id' => $user->id,
            'status' => $status,
        ]);

        // Create notification
        $user->notifications()->create([
            'actor_id' => $authUser->id,
            'type' => $status === 'pending' ? 'follow_request' : 'follow',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'message' => $status === 'pending' 
                ? $authUser->display_name . ' requested to follow you'
                : $authUser->display_name . ' started following you',
        ]);

        return $this->success([
            'status' => $status,
        ], $status === 'pending' ? 'Follow request sent' : 'Now following ' . $user->display_name);
    }

    /**
     * Unfollow a user.
     */
    public function unfollow(Request $request, User $user)
    {
        $authUser = $request->user();

        $follow = Follow::where('follower_id', $authUser->id)
            ->where('following_id', $user->id)
            ->first();

        if (!$follow) {
            return $this->error('You are not following this user', 400);
        }

        $follow->delete();

        return $this->success(null, 'Unfollowed ' . $user->display_name);
    }

    /**
     * Accept a follow request.
     */
    public function acceptFollowRequest(Request $request, User $user)
    {
        $authUser = $request->user();

        $follow = Follow::where('follower_id', $user->id)
            ->where('following_id', $authUser->id)
            ->where('status', 'pending')
            ->first();

        if (!$follow) {
            return $this->error('No pending follow request from this user', 404);
        }

        $follow->update(['status' => 'accepted']);

        // Notify the follower
        $user->notifications()->create([
            'actor_id' => $authUser->id,
            'type' => 'follow',
            'notifiable_type' => User::class,
            'notifiable_id' => $authUser->id,
            'message' => $authUser->display_name . ' accepted your follow request',
        ]);

        return $this->success(null, 'Follow request accepted');
    }

    /**
     * Reject a follow request.
     */
    public function rejectFollowRequest(Request $request, User $user)
    {
        $authUser = $request->user();

        $follow = Follow::where('follower_id', $user->id)
            ->where('following_id', $authUser->id)
            ->where('status', 'pending')
            ->first();

        if (!$follow) {
            return $this->error('No pending follow request from this user', 404);
        }

        $follow->delete();

        return $this->success(null, 'Follow request rejected');
    }

    /**
     * Get pending follow requests.
     */
    public function pendingFollowRequests(Request $request)
    {
        $authUser = $request->user();

        $requests = $authUser->pendingFollowRequests()->paginate(20);

        return $this->paginated(
            $requests->through(fn ($user) => $this->formatUser($user, $authUser))
        );
    }

    /**
     * Remove a follower.
     */
    public function removeFollower(Request $request, User $user)
    {
        $authUser = $request->user();

        $follow = Follow::where('follower_id', $user->id)
            ->where('following_id', $authUser->id)
            ->first();

        if (!$follow) {
            return $this->error('This user is not following you', 400);
        }

        $follow->delete();

        return $this->success(null, 'Follower removed');
    }

    /**
     * Block a user.
     */
    public function block(Request $request, User $user)
    {
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return $this->error('You cannot block yourself', 400);
        }

        if ($authUser->hasBlocked($user)) {
            return $this->error('User is already blocked', 400);
        }

        $authUser->blockedUsers()->attach($user->id);

        // Remove any follow relationships
        Follow::where(function ($q) use ($authUser, $user) {
            $q->where('follower_id', $authUser->id)->where('following_id', $user->id);
        })->orWhere(function ($q) use ($authUser, $user) {
            $q->where('follower_id', $user->id)->where('following_id', $authUser->id);
        })->delete();

        return $this->success(null, 'User blocked');
    }

    /**
     * Unblock a user.
     */
    public function unblock(Request $request, User $user)
    {
        $authUser = $request->user();

        if (!$authUser->hasBlocked($user)) {
            return $this->error('User is not blocked', 400);
        }

        $authUser->blockedUsers()->detach($user->id);

        return $this->success(null, 'User unblocked');
    }

    /**
     * Get blocked users.
     */
    public function blockedUsers(Request $request)
    {
        $authUser = $request->user();
        $blocked = $authUser->blockedUsers()->paginate(20);

        return $this->paginated(
            $blocked->through(fn ($user) => $this->formatUser($user, $authUser))
        );
    }

    /**
     * Mute a user.
     */
    public function mute(Request $request, User $user)
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'duration' => ['nullable', 'integer', 'min:1'], // hours, null = permanent
        ]);

        if ($authUser->id === $user->id) {
            return $this->error('You cannot mute yourself', 400);
        }

        $expiresAt = isset($validated['duration']) 
            ? now()->addHours($validated['duration']) 
            : null;

        $authUser->mutedUsers()->syncWithoutDetaching([
            $user->id => ['expires_at' => $expiresAt],
        ]);

        return $this->success(null, 'User muted');
    }

    /**
     * Unmute a user.
     */
    public function unmute(Request $request, User $user)
    {
        $authUser = $request->user();
        $authUser->mutedUsers()->detach($user->id);

        return $this->success(null, 'User unmuted');
    }

    /**
     * Get muted users.
     */
    public function mutedUsers(Request $request)
    {
        $authUser = $request->user();
        $muted = $authUser->mutedUsers()->paginate(20);

        return $this->paginated(
            $muted->through(fn ($user) => [
                ...$this->formatUser($user, $authUser),
                'muted_until' => $user->pivot->expires_at,
            ])
        );
    }

    /**
     * Get suggested users to follow.
     */
    public function suggestions(Request $request)
    {
        $authUser = $request->user();
        $followingIds = $authUser->following()->pluck('users.id')->toArray();
        $blockedIds = $authUser->blockedUsers()->pluck('blocked_id')->toArray();
        $blockedByIds = $authUser->blockedBy()->pluck('blocker_id')->toArray();
        $excludeIds = array_merge($followingIds, $blockedIds, $blockedByIds, [$authUser->id]);

        $suggestions = User::whereNotIn('id', $excludeIds)
            ->where('is_active', true)
            ->where('privacy', 'public')
            ->withCount('followers')
            ->orderByDesc('followers_count')
            ->limit(10)
            ->get();

        return $this->success([
            'users' => $suggestions->map(fn ($user) => $this->formatUser($user, $authUser)),
        ]);
    }

    /**
     * Get follow status between auth user and target user.
     */
    private function getFollowStatus(User $authUser, User $targetUser): ?string
    {
        $follow = Follow::where('follower_id', $authUser->id)
            ->where('following_id', $targetUser->id)
            ->first();

        return $follow?->status;
    }

    /**
     * Format user for API response.
     */
    private function formatUser(User $user, User $authUser): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'display_name' => $user->display_name,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'cover_photo_url' => $user->cover_photo_url,
            'location' => $user->location,
            'website' => $user->website,
            'is_verified' => $user->is_verified,
            'privacy' => $user->privacy,
            'followers_count' => $user->followers_count,
            'following_count' => $user->following_count,
            'posts_count' => $user->posts_count,
            'is_following' => $authUser->isFollowing($user),
            'is_followed_by' => $user->isFollowing($authUser),
            'created_at' => $user->created_at->toISOString(),
        ];
    }
}
