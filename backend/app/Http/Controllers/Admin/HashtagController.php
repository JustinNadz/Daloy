<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hashtag;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HashtagController extends Controller
{
    public function index(Request $request)
    {
        $query = Hashtag::query();

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'banned') {
                $query->where('is_banned', true);
            } elseif ($request->status === 'active') {
                $query->where('is_banned', false);
            }
        }

        $sortBy = $request->get('sort', 'posts_count');
        $sortOrder = $request->get('order', 'desc');

        $hashtags = $query->orderBy($sortBy, $sortOrder)->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $hashtags,
        ]);
    }

    public function trending(Request $request)
    {
        $range = $request->get('range', '24h');
        
        $hours = match ($range) {
            '1h' => 1,
            '24h' => 24,
            '7d' => 168,
            '30d' => 720,
            default => 24,
        };

        // Get trending hashtags based on recent usage
        $trending = DB::table('hashtag_post')
            ->join('hashtags', 'hashtags.id', '=', 'hashtag_post.hashtag_id')
            ->join('posts', 'posts.id', '=', 'hashtag_post.post_id')
            ->where('posts.created_at', '>=', now()->subHours($hours))
            ->where('hashtags.is_banned', false)
            ->select('hashtags.*', DB::raw('COUNT(*) as recent_count'))
            ->groupBy('hashtags.id')
            ->orderBy('recent_count', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trending,
        ]);
    }

    public function show(Hashtag $hashtag)
    {
        $hashtag->load(['posts' => function ($q) {
            $q->latest()->limit(10)->with('user:id,username,display_name,avatar_url');
        }]);

        return response()->json([
            'success' => true,
            'data' => $hashtag,
        ]);
    }

    public function ban(Request $request, Hashtag $hashtag)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $hashtag->update([
            'is_banned' => true,
            'banned_at' => now(),
            'ban_reason' => $validated['reason'] ?? null,
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'hashtag_banned',
            'target_type' => Hashtag::class,
            'target_id' => $hashtag->id,
            'details' => [
                'name' => $hashtag->name,
                'reason' => $validated['reason'] ?? null,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hashtag banned successfully',
        ]);
    }

    public function unban(Request $request, Hashtag $hashtag)
    {
        $hashtag->update([
            'is_banned' => false,
            'banned_at' => null,
            'ban_reason' => null,
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'hashtag_unbanned',
            'target_type' => Hashtag::class,
            'target_id' => $hashtag->id,
            'details' => ['name' => $hashtag->name],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hashtag unbanned successfully',
        ]);
    }

    public function stats()
    {
        $totalHashtags = Hashtag::count();
        $bannedHashtags = Hashtag::where('is_banned', true)->count();
        $activeToday = DB::table('hashtag_post')
            ->join('posts', 'posts.id', '=', 'hashtag_post.post_id')
            ->where('posts.created_at', '>=', now()->startOfDay())
            ->distinct('hashtag_post.hashtag_id')
            ->count('hashtag_post.hashtag_id');

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalHashtags,
                'banned' => $bannedHashtags,
                'active_today' => $activeToday,
            ],
        ]);
    }
}
