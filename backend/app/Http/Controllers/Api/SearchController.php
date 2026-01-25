<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Global search.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:100'],
            'type' => ['sometimes', 'in:all,users,posts,hashtags'],
        ]);

        $query = $validated['q'];
        $type = $validated['type'] ?? 'all';
        $user = $request->user();

        $results = [];

        if ($type === 'all' || $type === 'users') {
            $results['users'] = $this->searchUsers($query, $user);
        }

        if ($type === 'all' || $type === 'posts') {
            $results['posts'] = $this->searchPosts($query, $user);
        }

        if ($type === 'all' || $type === 'hashtags') {
            $results['hashtags'] = $this->searchHashtags($query);
        }

        return $this->success($results);
    }

    /**
     * Search users.
     */
    public function users(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:100'],
        ]);

        $user = $request->user();
        $users = $this->searchUsers($validated['q'], $user, 20);

        return $this->success(['users' => $users]);
    }

    /**
     * Search posts.
     */
    public function posts(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:100'],
        ]);

        $user = $request->user();
        $posts = $this->searchPosts($validated['q'], $user, 20);

        return $this->success(['posts' => $posts]);
    }

    /**
     * Search hashtags.
     */
    public function hashtags(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:100'],
        ]);

        $hashtags = $this->searchHashtags($validated['q'], 20);

        return $this->success(['hashtags' => $hashtags]);
    }

    /**
     * Get trending hashtags.
     */
    public function trending(Request $request)
    {
        $validated = $request->validate([
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $limit = $validated['limit'] ?? 10;

        $hashtags = Hashtag::trending(24)
            ->limit($limit)
            ->get();

        return $this->success([
            'hashtags' => $hashtags->map(fn ($h) => [
                'id' => $h->id,
                'name' => $h->name,
                'slug' => $h->slug,
                'posts_count' => $h->posts_count,
            ]),
        ]);
    }

    /**
     * Get posts by hashtag.
     */
    public function hashtagPosts(Request $request, string $slug)
    {
        $hashtag = Hashtag::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        $posts = $hashtag->posts()
            ->with(['user', 'media'])
            ->where('privacy', 'public')
            ->whereNull('parent_id')
            ->latest()
            ->paginate(20);

        return $this->paginated($posts->through(fn ($post) => [
            'id' => $post->id,
            'content' => $post->content,
            'user' => [
                'id' => $post->user->id,
                'username' => $post->user->username,
                'display_name' => $post->user->display_name,
                'avatar_url' => $post->user->avatar_url,
                'is_verified' => $post->user->is_verified,
            ],
            'media' => $post->media->map(fn ($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'url' => $m->url,
            ]),
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'reposts_count' => $post->reposts_count,
            'created_at' => $post->created_at->toISOString(),
        ]));
    }

    private function searchUsers(string $query, User $authUser, int $limit = 5): array
    {
        $blockedIds = $authUser->blockedUsers()->pluck('blocked_id')->toArray();
        $blockedByIds = $authUser->blockedBy()->pluck('blocker_id')->toArray();
        $excludeIds = array_merge($blockedIds, $blockedByIds);

        $users = User::where(function ($q) use ($query) {
                $q->where('username', 'like', "%{$query}%")
                    ->orWhere('display_name', 'like', "%{$query}%");
            })
            ->whereNotIn('id', $excludeIds)
            ->where('is_active', true)
            ->limit($limit)
            ->get();

        return $users->map(fn ($u) => [
            'id' => $u->id,
            'username' => $u->username,
            'display_name' => $u->display_name,
            'avatar_url' => $u->avatar_url,
            'bio' => $u->bio,
            'is_verified' => $u->is_verified,
            'followers_count' => $u->followers_count,
            'is_following' => $authUser->isFollowing($u),
        ])->toArray();
    }

    private function searchPosts(string $query, User $authUser, int $limit = 5): array
    {
        $blockedIds = $authUser->blockedUsers()->pluck('blocked_id')->toArray();
        $blockedByIds = $authUser->blockedBy()->pluck('blocker_id')->toArray();
        $excludeIds = array_merge($blockedIds, $blockedByIds);

        $posts = Post::with(['user', 'media'])
            ->where('content', 'like', "%{$query}%")
            ->where('privacy', 'public')
            ->whereNull('parent_id')
            ->whereNotIn('user_id', $excludeIds)
            ->latest()
            ->limit($limit)
            ->get();

        return $posts->map(fn ($p) => [
            'id' => $p->id,
            'content' => $p->content,
            'user' => [
                'id' => $p->user->id,
                'username' => $p->user->username,
                'display_name' => $p->user->display_name,
                'avatar_url' => $p->user->avatar_url,
            ],
            'likes_count' => $p->likes_count,
            'comments_count' => $p->comments_count,
            'created_at' => $p->created_at->toISOString(),
        ])->toArray();
    }

    private function searchHashtags(string $query, int $limit = 5): array
    {
        $query = ltrim($query, '#');

        $hashtags = Hashtag::where('name', 'like', "%{$query}%")
            ->orderByDesc('posts_count')
            ->limit($limit)
            ->get();

        return $hashtags->map(fn ($h) => [
            'id' => $h->id,
            'name' => $h->name,
            'slug' => $h->slug,
            'posts_count' => $h->posts_count,
        ])->toArray();
    }
}
