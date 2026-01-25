<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use App\Models\BookmarkCollection;
use App\Models\Post;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    /**
     * Get user's bookmarks.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $bookmarks = $user->bookmarks()
            ->with(['post.user', 'post.media', 'collection'])
            ->latest()
            ->paginate(20);

        return $this->paginated($bookmarks->through(fn ($bookmark) => [
            'id' => $bookmark->id,
            'post' => $this->formatPost($bookmark->post, $user),
            'collection' => $bookmark->collection ? [
                'id' => $bookmark->collection->id,
                'name' => $bookmark->collection->name,
            ] : null,
            'created_at' => $bookmark->created_at->toISOString(),
        ]));
    }

    /**
     * Bookmark a post.
     */
    public function store(Request $request, Post $post)
    {
        $user = $request->user();

        $validated = $request->validate([
            'collection_id' => ['nullable', 'exists:bookmark_collections,id'],
        ]);

        // Check if collection belongs to user
        if (isset($validated['collection_id'])) {
            $collection = BookmarkCollection::find($validated['collection_id']);
            if ($collection->user_id !== $user->id) {
                return $this->error('Invalid collection', 403);
            }
        }

        $existing = $user->bookmarks()->where('post_id', $post->id)->first();

        if ($existing) {
            // Update collection if provided
            if (isset($validated['collection_id'])) {
                $existing->update(['collection_id' => $validated['collection_id']]);
                return $this->success(null, 'Bookmark updated');
            }
            return $this->error('Post already bookmarked', 400);
        }

        $user->bookmarks()->create([
            'post_id' => $post->id,
            'collection_id' => $validated['collection_id'] ?? null,
        ]);

        $post->increment('bookmarks_count');

        return $this->success(null, 'Post bookmarked', 201);
    }

    /**
     * Remove bookmark.
     */
    public function destroy(Request $request, Post $post)
    {
        $user = $request->user();

        $bookmark = $user->bookmarks()->where('post_id', $post->id)->first();

        if (!$bookmark) {
            return $this->error('Post is not bookmarked', 400);
        }

        $bookmark->delete();
        $post->decrement('bookmarks_count');

        return $this->success(null, 'Bookmark removed');
    }

    /**
     * Get user's bookmark collections.
     */
    public function collections(Request $request)
    {
        $user = $request->user();

        $collections = $user->bookmarkCollections()
            ->withCount('bookmarks')
            ->latest()
            ->get();

        return $this->success([
            'collections' => $collections->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->description,
                'is_private' => $c->is_private,
                'bookmarks_count' => $c->bookmarks_count,
                'created_at' => $c->created_at->toISOString(),
            ]),
        ]);
    }

    /**
     * Create a bookmark collection.
     */
    public function createCollection(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:160'],
            'is_private' => ['sometimes', 'boolean'],
        ]);

        $collection = $user->bookmarkCollections()->create($validated);

        return $this->success([
            'collection' => [
                'id' => $collection->id,
                'name' => $collection->name,
                'description' => $collection->description,
                'is_private' => $collection->is_private,
            ],
        ], 'Collection created', 201);
    }

    /**
     * Update a bookmark collection.
     */
    public function updateCollection(Request $request, BookmarkCollection $collection)
    {
        $user = $request->user();

        if ($collection->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:160'],
            'is_private' => ['sometimes', 'boolean'],
        ]);

        $collection->update($validated);

        return $this->success([
            'collection' => [
                'id' => $collection->id,
                'name' => $collection->name,
                'description' => $collection->description,
                'is_private' => $collection->is_private,
            ],
        ], 'Collection updated');
    }

    /**
     * Delete a bookmark collection.
     */
    public function deleteCollection(Request $request, BookmarkCollection $collection)
    {
        $user = $request->user();

        if ($collection->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        // Move bookmarks to no collection
        $collection->bookmarks()->update(['collection_id' => null]);
        $collection->delete();

        return $this->success(null, 'Collection deleted');
    }

    /**
     * Get bookmarks in a collection.
     */
    public function collectionBookmarks(Request $request, BookmarkCollection $collection)
    {
        $user = $request->user();

        if ($collection->user_id !== $user->id && $collection->is_private) {
            return $this->error('Unauthorized', 403);
        }

        $bookmarks = $collection->bookmarks()
            ->with(['post.user', 'post.media'])
            ->latest()
            ->paginate(20);

        return $this->paginated($bookmarks->through(fn ($bookmark) => [
            'id' => $bookmark->id,
            'post' => $this->formatPost($bookmark->post, $user),
            'created_at' => $bookmark->created_at->toISOString(),
        ]));
    }

    private function formatPost(Post $post, $user): array
    {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'user' => [
                'id' => $post->user->id,
                'username' => $post->user->username,
                'display_name' => $post->user->display_name,
                'avatar_url' => $post->user->avatar_url,
            ],
            'media' => $post->media->map(fn ($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'url' => $m->url,
            ]),
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'created_at' => $post->created_at->toISOString(),
        ];
    }
}
