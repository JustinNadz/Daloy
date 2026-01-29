<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Notifications\AccountDeletionScheduledNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PrivacyController extends Controller
{
    use \App\Traits\ApiResponse;

    /**
     * Export all user data (GDPR - Right to Data Portability)
     */
    public function exportData(Request $request)
    {
        $user = $request->user()->load([
            'posts',
            'comments',
            'sentMessages',
            'receivedMessages',
            'likes',
            'groups',
            'events',
            'followers',
            'following'
        ]);

        $data = [
            'exported_at' => now()->toIso8601String(),
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'bio' => $user->bio,
                'location' => $user->location,
                'website' => $user->website,
                'birthday' => $user->birthday,
                'email_verified_at' => $user->email_verified_at,
                'terms_accepted_at' => $user->terms_accepted_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'posts' => $user->posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'media' => $post->media,
                    'visibility' => $post->visibility,
                    'likes_count' => $post->likes_count,
                    'comments_count' => $post->comments_count,
                    'created_at' => $post->created_at,
                ];
            }),
            'comments' => $user->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'post_id' => $comment->post_id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                ];
            }),
            'messages_sent' => $user->sentMessages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'to' => $message->receiver->username,
                    'content' => $message->content,
                    'created_at' => $message->created_at,
                ];
            }),
            'messages_received' => $user->receivedMessages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'from' => $message->sender->username,
                    'content' => $message->content,
                    'created_at' => $message->created_at,
                ];
            }),
            'likes' => $user->likes->map(function ($like) {
                return [
                    'post_id' => $like->post_id,
                    'created_at' => $like->created_at,
                ];
            }),
            'groups' => $user->groups->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'joined_at' => $group->pivot->created_at,
                ];
            }),
            'followers_count' => $user->followers->count(),
            'following_count' => $user->following->count(),
        ];

        Log::info("User data exported: {$user->id}");

        return response()->json($data);
    }

    /**
     * Request account deletion (GDPR - Right to be Forgotten)
     */
    public function requestAccountDeletion(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
            'confirmation' => 'required|in:DELETE MY ACCOUNT',
        ]);

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Invalid password', 401);
        }

        // Mark for deletion (30-day grace period)
        $user->deletion_requested_at = now();
        $user->save();

        // Send confirmation email
        $user->notify(new AccountDeletionScheduledNotification());

        // Log the request
        Log::info("Account deletion requested: {$user->id}");

        // Log out user
        $request->user()->tokens()->delete();

        return $this->success([
            'message' => 'Account deletion scheduled. You have 30 days to cancel.',
            'deletion_date' => now()->addDays(30)->toDateString(),
        ]);
    }

    /**
     * Cancel account deletion
     */
    public function cancelAccountDeletion(Request $request)
    {
        $user = $request->user();

        if (!$user->deletion_requested_at) {
            return $this->error('No deletion request found', 400);
        }

        $user->deletion_requested_at = null;
        $user->save();

        Log::info("Account deletion cancelled: {$user->id}");

        return $this->success([
            'message' => 'Account deletion cancelled successfully.',
        ]);
    }

    /**
     * Permanently delete account (called by scheduled job)
     */
    public static function permanentlyDeleteAccount($userId)
    {
        $user = \App\Models\User::withTrashed()->find($userId);

        if (!$user) {
            return;
        }

        // Anonymize or delete content
        $user->posts()->update([
            'content' => '[deleted]',
            'user_id' => null
        ]);

        $user->comments()->delete();
        $user->messages()->delete();
        $user->likes()->delete();
        $user->notifications()->delete();

        // Soft delete user
        $user->delete();

        Log::info("Account permanently deleted: {$userId}");
    }
}
