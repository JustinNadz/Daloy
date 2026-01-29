<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class CommentModerationController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::whereNotNull('parent_id')
            ->with(['user:id,username,display_name,avatar_url', 'parent:id,content,user_id', 'parent.user:id,username']);

        if ($request->has('search') && $request->search) {
            $query->where('content', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'reported') {
                $query->whereHas('reports', function ($q) {
                    $q->where('status', 'pending');
                });
            } elseif ($request->status === 'hidden') {
                $query->where('is_hidden', true);
            }
        }

        $comments = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    public function show(Post $comment)
    {
        if (!$comment->parent_id) {
            return response()->json([
                'success' => false,
                'message' => 'This is not a comment',
            ], 400);
        }

        $comment->load([
            'user:id,username,display_name,avatar_url',
            'parent:id,content,user_id',
            'parent.user:id,username',
            'reports' => function ($q) {
                $q->where('status', 'pending');
            },
        ]);

        return response()->json([
            'success' => true,
            'data' => $comment,
        ]);
    }

    public function hide(Request $request, Post $comment)
    {
        $comment->update(['is_hidden' => true]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'comment_hidden',
            'target_type' => Post::class,
            'target_id' => $comment->id,
            'details' => ['reason' => $request->reason],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment hidden successfully',
        ]);
    }

    public function unhide(Request $request, Post $comment)
    {
        $comment->update(['is_hidden' => false]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'comment_unhidden',
            'target_type' => Post::class,
            'target_id' => $comment->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment restored successfully',
        ]);
    }

    public function destroy(Request $request, Post $comment)
    {
        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'comment_deleted',
            'target_type' => Post::class,
            'target_id' => $comment->id,
            'details' => [
                'content' => substr($comment->content, 0, 200),
                'user_id' => $comment->user_id,
                'reason' => $request->reason,
            ],
            'ip_address' => $request->ip(),
        ]);

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully',
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:posts,id',
            'reason' => 'nullable|string',
        ]);

        $comments = Post::whereIn('id', $validated['comment_ids'])
            ->whereNotNull('parent_id')
            ->get();

        foreach ($comments as $comment) {
            AdminLog::create([
                'admin_id' => auth()->id(),
                'action' => 'comment_deleted',
                'target_type' => Post::class,
                'target_id' => $comment->id,
                'details' => [
                    'bulk_delete' => true,
                    'reason' => $validated['reason'] ?? null,
                ],
                'ip_address' => $request->ip(),
            ]);
        }

        Post::whereIn('id', $validated['comment_ids'])->delete();

        return response()->json([
            'success' => true,
            'message' => count($validated['comment_ids']) . ' comments deleted successfully',
        ]);
    }
}
