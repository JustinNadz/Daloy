<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    /**
     * Get feed posts.
     */
    public function feed(Request $request)
    {
        $user = $request->user();
        $followingIds = $user->acceptedFollowing()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $posts = Post::with(['user', 'media', 'originalPost.user', 'quotedPost.user'])
            ->withCount(['reactions', 'comments', 'reposts', 'bookmarks'])
            ->whereIn('user_id', $followingIds)
            ->whereNull('parent_id') // Main posts only
            ->where(function ($query) use ($user) {
                $query->where('privacy', 'public')
                    ->orWhere('privacy', 'followers')
                    ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->paginate(20);

        return $this->paginated($posts->through(fn($post) => $this->formatPost($post, $user)));
    }

    /**
     * Get explore/discover posts.
     */
    public function explore(Request $request)
    {
        $user = $request->user();

        $posts = Post::with(['user', 'media', 'originalPost.user', 'quotedPost.user'])
            ->withCount(['reactions', 'comments', 'reposts', 'bookmarks'])
            ->whereNull('parent_id')
            ->where('privacy', 'public')
            ->where('user_id', '!=', $user->id)
            ->orderByDesc('likes_count')
            ->orderByDesc('created_at')
            ->paginate(20);

        return $this->paginated($posts->through(fn($post) => $this->formatPost($post, $user)));
    }

    /**
     * Get public posts for unauthenticated users.
     */
    public function publicFeed(Request $request)
    {
        $posts = Post::with(['user'])->where('privacy', 'public')->latest()->limit(10)->get();

        $formattedPosts = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'created_at' => $post->created_at,
                'user' => [
                    'username' => $post->user->username,
                    'display_name' => $post->user->display_name,
                    'avatar_url' => $post->user->avatar_url ?? null,
                ],
                'reactions_count' => 0,
                'comments_count' => 0,
                'reposts_count' => 0,
            ];
        })->toArray();

        return response()->json([
            'data' => [
                'posts' => array_values($formattedPosts)
            ]
        ]);
    }

    /**
     * Show a single post (public).
     */
    public function showPublic(Post $post)
    {
        if ($post->privacy !== 'public') {
            return $this->error('This post is not public', 403);
        }

        $post->load(['user', 'media', 'originalPost.user', 'quotedPost.user', 'hashtags']);
        $post->loadCount(['reactions', 'comments', 'reposts']);
        $post->incrementViews();

        return $this->success($this->formatPostPublic($post));
    }

    /**
     * Format post for public display (without auth-specific data).
     */
    protected function formatPostPublic(Post $post): array
    {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'privacy' => $post->privacy,
            'is_repost' => $post->is_repost,
            'is_pinned' => $post->is_pinned,
            'is_edited' => $post->is_edited,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
            'user' => $post->user ? [
                'id' => $post->user->id,
                'username' => $post->user->username,
                'display_name' => $post->user->display_name,
                'avatar' => $post->user->avatar_url,
                'is_verified' => $post->user->is_verified,
            ] : null,
            'media' => $post->media->map(fn($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'url' => $m->url,
                'thumbnail_url' => $m->thumbnail_url,
            ]),
            'reactions_count' => $post->reactions_count ?? 0,
            'comments_count' => $post->comments_count ?? 0,
            'reposts_count' => $post->reposts_count ?? 0,
            'original_post' => $post->originalPost ? [
                'id' => $post->originalPost->id,
                'user' => [
                    'username' => $post->originalPost->user->username,
                    'display_name' => $post->originalPost->user->display_name,
                ],
            ] : null,
            'quoted_post' => $post->quotedPost ? $this->formatPostPublic($post->quotedPost) : null,
        ];
    }

    /**
     * Create a new post.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => ['required_without:media', 'string', 'max:500'],
            'privacy' => ['sometimes', 'in:public,followers,private'],
            'media' => ['sometimes', 'array', 'max:4'],
            'media.*' => ['file', 'mimes:jpeg,png,jpg,gif,mp4,webm', 'max:51200'], // 50MB
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            $post = $user->posts()->create([
                'content' => $validated['content'] ?? '',
                'privacy' => $validated['privacy'] ?? 'public',
            ]);

            // Handle media uploads
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $index => $file) {
                    $this->uploadMedia($post, $file, $user, $index);
                }
            }

            // Extract and save hashtags
            $this->processHashtags($post);

            // Extract and save mentions
            $this->processMentions($post, $user);

            DB::commit();

            $post->load(['user', 'media', 'hashtags']);

            return $this->success(
                $this->formatPost($post, $user),
                'Post created successfully',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create post: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single post.
     */
    public function show(Request $request, Post $post)
    {
        $user = $request->user();

        // Check if user can view this post
        if (!$this->canViewPost($post, $user)) {
            return $this->error('You cannot view this post', 403);
        }

        $post->load(['user', 'media', 'originalPost.user', 'quotedPost.user', 'hashtags']);
        $post->loadCount(['reactions', 'comments', 'reposts', 'bookmarks']);
        $post->incrementViews();

        return $this->success($this->formatPost($post, $user));
    }

    /**
     * Update a post.
     */
    public function update(Request $request, Post $post)
    {
        $user = $request->user();

        if ($post->user_id !== $user->id) {
            return $this->error('You can only edit your own posts', 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:500'],
            'privacy' => ['sometimes', 'in:public,followers,private'],
        ]);

        $post->update([
            'content' => $validated['content'],
            'privacy' => $validated['privacy'] ?? $post->privacy,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        // Re-process hashtags and mentions
        $post->hashtags()->detach();
        $post->mentions()->delete();
        $this->processHashtags($post);
        $this->processMentions($post, $user);

        $post->load(['user', 'media', 'hashtags']);

        return $this->success($this->formatPost($post->fresh(), $user), 'Post updated successfully');
    }

    /**
     * Delete a post.
     */
    public function destroy(Request $request, Post $post)
    {
        $user = $request->user();

        if ($post->user_id !== $user->id) {
            return $this->error('You can only delete your own posts', 403);
        }

        $post->delete();

        return $this->success(null, 'Post deleted successfully');
    }

    /**
     * Get post comments/replies.
     */
    public function comments(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$this->canViewPost($post, $user)) {
            return $this->error('You cannot view this post', 403);
        }

        $comments = $post->comments()
            ->with(['user', 'media'])
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->paginate(20);

        return $this->paginated($comments->through(fn($comment) => $this->formatPost($comment, $user)));
    }

    /**
     * Create a comment/reply.
     */
    public function comment(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$this->canViewPost($post, $user)) {
            return $this->error('You cannot comment on this post', 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:500'],
            'media' => ['sometimes', 'array', 'max:4'],
            'media.*' => ['file', 'mimes:jpeg,png,jpg,gif,mp4,webm', 'max:51200'],
        ]);

        DB::beginTransaction();
        try {
            $comment = $user->posts()->create([
                'content' => $validated['content'],
                'parent_id' => $post->id,
                'privacy' => $post->privacy,
            ]);

            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $index => $file) {
                    $this->uploadMedia($comment, $file, $user, $index);
                }
            }

            $this->processHashtags($comment);
            $this->processMentions($comment, $user);

            // Update parent post comment count
            $post->increment('comments_count');

            // Create notification for post owner
            if ($post->user_id !== $user->id) {
                $post->user->notifications()->create([
                    'actor_id' => $user->id,
                    'type' => 'comment',
                    'notifiable_type' => Post::class,
                    'notifiable_id' => $post->id,
                    'message' => $user->display_name . ' commented on your post',
                ]);
            }

            DB::commit();

            $comment->load(['user', 'media']);

            return $this->success(
                $this->formatPost($comment, $user),
                'Comment added successfully',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to add comment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Repost a post.
     */
    public function repost(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$this->canViewPost($post, $user)) {
            return $this->error('You cannot repost this post', 403);
        }

        // Check if already reposted
        $existingRepost = $user->posts()->where('original_post_id', $post->id)->where('is_repost', true)->first();
        if ($existingRepost) {
            return $this->error('You have already reposted this post', 400);
        }

        $repost = $user->posts()->create([
            'content' => '',
            'original_post_id' => $post->id,
            'is_repost' => true,
            'privacy' => 'public',
        ]);

        $post->increment('reposts_count');

        // Notify post owner
        if ($post->user_id !== $user->id) {
            $post->user->notifications()->create([
                'actor_id' => $user->id,
                'type' => 'repost',
                'notifiable_type' => Post::class,
                'notifiable_id' => $post->id,
                'message' => $user->display_name . ' reposted your post',
            ]);
        }

        $repost->load(['user', 'originalPost.user', 'originalPost.media']);

        return $this->success($this->formatPost($repost, $user), 'Reposted successfully', 201);
    }

    /**
     * Undo repost.
     */
    public function undoRepost(Request $request, Post $post)
    {
        $user = $request->user();

        $repost = $user->posts()->where('original_post_id', $post->id)->where('is_repost', true)->first();

        if (!$repost) {
            return $this->error('You have not reposted this post', 400);
        }

        $repost->delete();
        $post->decrement('reposts_count');

        return $this->success(null, 'Repost removed');
    }

    /**
     * Quote a post.
     */
    public function quote(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$this->canViewPost($post, $user)) {
            return $this->error('You cannot quote this post', 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:500'],
        ]);

        $quote = $user->posts()->create([
            'content' => $validated['content'],
            'quoted_post_id' => $post->id,
            'privacy' => 'public',
        ]);

        $this->processHashtags($quote);
        $this->processMentions($quote, $user);

        // Notify post owner
        if ($post->user_id !== $user->id) {
            $post->user->notifications()->create([
                'actor_id' => $user->id,
                'type' => 'quote',
                'notifiable_type' => Post::class,
                'notifiable_id' => $post->id,
                'message' => $user->display_name . ' quoted your post',
            ]);
        }

        $quote->load(['user', 'quotedPost.user', 'quotedPost.media']);

        return $this->success($this->formatPost($quote, $user), 'Quote posted successfully', 201);
    }

    /**
     * Get user's posts.
     */
    public function userPosts(Request $request, User $user)
    {
        $authUser = $request->user();
        $canViewPrivate = $authUser->id === $user->id || $authUser->isFollowing($user);

        $posts = $user->posts()
            ->with(['user', 'media', 'originalPost.user', 'quotedPost.user'])
            ->withCount(['reactions', 'comments', 'reposts', 'bookmarks'])
            ->whereNull('parent_id')
            ->when(!$canViewPrivate, function ($query) {
                $query->where('privacy', 'public');
            })
            ->latest()
            ->paginate(20);

        return $this->paginated($posts->through(fn($post) => $this->formatPost($post, $authUser)));
    }

    /**
     * Upload media for a post.
     */
    private function uploadMedia(Post $post, $file, User $user, int $order = 0): void
    {
        $path = $file->store('posts/' . $user->id, 'public');
        $mimeType = $file->getMimeType();
        $isVideo = str_starts_with($mimeType, 'video/');

        $post->media()->create([
            'user_id' => $user->id,
            'type' => $isVideo ? 'video' : 'image',
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'path' => $path,
            'url' => asset('storage/' . $path),
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
            'order' => $order,
        ]);
    }

    /**
     * Process hashtags in post content.
     */
    private function processHashtags(Post $post): void
    {
        $hashtags = $post->extractHashtags();

        foreach ($hashtags as $tag) {
            $hashtag = Hashtag::findOrCreateByName($tag);
            $post->hashtags()->attach($hashtag->id);
            $hashtag->increment('posts_count');
        }
    }

    /**
     * Process mentions in post content.
     */
    private function processMentions(Post $post, User $author): void
    {
        $usernames = $post->extractMentions();

        foreach ($usernames as $username) {
            $mentionedUser = User::where('username', $username)->first();

            if ($mentionedUser && $mentionedUser->id !== $author->id) {
                $post->mentions()->create([
                    'user_id' => $mentionedUser->id,
                    'mentioned_by' => $author->id,
                ]);

                // Create notification
                $mentionedUser->notifications()->create([
                    'actor_id' => $author->id,
                    'type' => 'mention',
                    'notifiable_type' => Post::class,
                    'notifiable_id' => $post->id,
                    'message' => $author->display_name . ' mentioned you in a post',
                ]);
            }
        }
    }

    /**
     * Check if user can view a post.
     */
    private function canViewPost(Post $post, User $user): bool
    {
        if ($post->user_id === $user->id) {
            return true;
        }

        if ($post->privacy === 'public') {
            return true;
        }

        if ($post->privacy === 'followers') {
            return $post->user->isFollowedBy($user);
        }

        return false;
    }

    /**
     * Format post for API response.
     */
    private function formatPost(Post $post, User $currentUser): array
    {
        $data = [
            'id' => $post->id,
            'content' => $post->content,
            'privacy' => $post->privacy,
            'is_repost' => $post->is_repost,
            'is_pinned' => $post->is_pinned,
            'is_edited' => $post->is_edited,
            'edited_at' => $post->edited_at?->toISOString(),
            'created_at' => $post->created_at->toISOString(),
            'user' => [
                'id' => $post->user->id,
                'username' => $post->user->username,
                'display_name' => $post->user->display_name,
                'avatar_url' => $post->user->avatar_url,
                'is_verified' => $post->user->is_verified,
            ],
            'media' => $post->media->map(fn($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'url' => $m->url,
                'thumbnail_url' => $m->thumbnail_url,
                'alt_text' => $m->alt_text,
            ])->toArray(),
            'likes_count' => $post->reactions_count ?? $post->likes_count,
            'comments_count' => $post->comments_count,
            'reposts_count' => $post->reposts_count,
            'bookmarks_count' => $post->bookmarks_count ?? 0,
            'views_count' => $post->views_count,
            'is_liked' => $post->hasReactedBy($currentUser),
            'is_bookmarked' => $post->isBookmarkedBy($currentUser),
            'is_reposted' => $post->isRepostedBy($currentUser),
        ];

        if ($post->originalPost) {
            $data['original_post'] = $this->formatPost($post->originalPost, $currentUser);
        }

        if ($post->quotedPost) {
            $data['quoted_post'] = $this->formatPost($post->quotedPost, $currentUser);
        }

        return $data;
    }

    /**
     * Format post for public API response (no authentication required).
     */
    private function formatPostForPublic(Post $post): array
    {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'privacy' => $post->privacy,
            'created_at' => $post->created_at->toISOString(),
            'user' => [
                'id' => $post->user->id,
                'username' => $post->user->username,
                'display_name' => $post->user->display_name,
                'avatar_url' => $post->user->avatar_url,
                'is_verified' => $post->user->is_verified ?? false,
            ],
            'media' => $post->media->map(fn($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'url' => $m->url,
            ])->toArray(),
            'reactions_count' => $post->reactions_count ?? 0,
            'comments_count' => $post->comments_count ?? 0,
            'reposts_count' => $post->reposts_count ?? 0,
            // For public feed, user interaction states are false
            'is_liked' => false,
            'is_bookmarked' => false,
            'is_reposted' => false,
        ];
    }
}
