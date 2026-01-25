<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    /**
     * Like/react to a post.
     */
    public function store(Request $request, Post $post)
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => ['sometimes', 'in:like,love,haha,wow,sad,angry'],
        ]);

        $type = $validated['type'] ?? 'like';

        $existingReaction = $post->reactions()->where('user_id', $user->id)->first();

        if ($existingReaction) {
            if ($existingReaction->type === $type) {
                // Remove reaction if same type
                $existingReaction->delete();
                $post->decrement('likes_count');
                return $this->success(['liked' => false], 'Reaction removed');
            } else {
                // Update reaction type
                $existingReaction->update(['type' => $type]);
                return $this->success(['liked' => true, 'type' => $type], 'Reaction updated');
            }
        }

        $post->reactions()->create([
            'user_id' => $user->id,
            'type' => $type,
        ]);

        $post->increment('likes_count');

        // Notify post owner
        if ($post->user_id !== $user->id) {
            $post->user->notifications()->create([
                'actor_id' => $user->id,
                'type' => 'like',
                'notifiable_type' => Post::class,
                'notifiable_id' => $post->id,
                'message' => $user->display_name . ' liked your post',
            ]);
        }

        return $this->success(['liked' => true, 'type' => $type], 'Post liked');
    }

    /**
     * Remove reaction from a post.
     */
    public function destroy(Request $request, Post $post)
    {
        $user = $request->user();

        $reaction = $post->reactions()->where('user_id', $user->id)->first();

        if (!$reaction) {
            return $this->error('You have not reacted to this post', 400);
        }

        $reaction->delete();
        $post->decrement('likes_count');

        return $this->success(null, 'Reaction removed');
    }

    /**
     * Get users who reacted to a post.
     */
    public function users(Request $request, Post $post)
    {
        $validated = $request->validate([
            'type' => ['sometimes', 'in:like,love,haha,wow,sad,angry'],
        ]);

        $query = $post->reactions()->with('user');

        if (isset($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $reactions = $query->latest()->paginate(20);

        return $this->paginated($reactions->through(fn ($reaction) => [
            'user' => [
                'id' => $reaction->user->id,
                'username' => $reaction->user->username,
                'display_name' => $reaction->user->display_name,
                'avatar_url' => $reaction->user->avatar_url,
                'is_verified' => $reaction->user->is_verified,
            ],
            'type' => $reaction->type,
            'created_at' => $reaction->created_at->toISOString(),
        ]));
    }
}
