<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminPostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user', 'media']);

        // Search
        if ($search = $request->get('search')) {
            $query->where('content', 'like', "%{$search}%");
        }

        // Filter by user
        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        // Filter by type
        if ($type = $request->get('type')) {
            switch ($type) {
                case 'original':
                    $query->whereNull('parent_id')->whereNull('repost_of_id');
                    break;
                case 'reply':
                    $query->whereNotNull('parent_id');
                    break;
                case 'repost':
                    $query->whereNotNull('repost_of_id');
                    break;
            }
        }

        // Filter by reported
        if ($request->boolean('reported')) {
            $query->whereHas('reports', function ($q) {
                $q->where('status', 'pending');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $posts = $query->withCount(['reactions', 'comments', 'reports'])
            ->paginate($request->get('per_page', 20));

        return response()->json($posts);
    }

    public function show(Post $post)
    {
        $post->load(['user', 'media', 'parent', 'repostOf']);
        $post->loadCount(['reactions', 'comments', 'reports']);

        return response()->json([
            'post' => $post,
        ]);
    }

    public function destroy(Request $request, Post $post)
    {
        $postId = $post->id;
        $username = $post->user->username ?? 'unknown';

        $post->delete();

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'post_deleted',
            'description' => "Deleted post #{$postId} by @{$username}",
            'target_type' => Post::class,
            'target_id' => $postId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'post_ids' => 'required|array|min:1',
            'post_ids.*' => 'integer|exists:posts,id',
        ]);

        $count = Post::whereIn('id', $request->post_ids)->delete();

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'posts_bulk_deleted',
            'description' => "Bulk deleted {$count} posts",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => "{$count} posts deleted successfully",
        ]);
    }
}
