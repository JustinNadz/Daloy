<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appeal;
use App\Models\User;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AppealController extends Controller
{
    public function index(Request $request)
    {
        $query = Appeal::with([
            'user:id,username,display_name,avatar_url,status',
            'reviewer:id,name,username',
        ]);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('appeal_type', $request->type);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhere('explanation', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('username', 'like', "%{$search}%");
                    });
            });
        }

        $appeals = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $appeals,
        ]);
    }

    public function show(Appeal $appeal)
    {
        $appeal->load([
            'user',
            'reviewer:id,name,username',
            'related',
        ]);

        return response()->json([
            'success' => true,
            'data' => $appeal,
        ]);
    }

    public function approve(Request $request, Appeal $appeal)
    {
        if (!in_array($appeal->status, ['pending', 'under_review'])) {
            return response()->json([
                'success' => false,
                'message' => 'This appeal has already been processed',
            ], 400);
        }

        $validated = $request->validate([
            'response' => 'required|string|max:2000',
        ]);

        $appeal->update([
            'status' => 'approved',
            'admin_response' => $validated['response'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Handle appeal type specific actions
        if ($appeal->appeal_type === 'suspension') {
            $appeal->user->update(['status' => 'active']);
        }

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'appeal_approved',
            'target_type' => Appeal::class,
            'target_id' => $appeal->id,
            'details' => [
                'user_id' => $appeal->user_id,
                'appeal_type' => $appeal->appeal_type,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appeal approved successfully',
        ]);
    }

    public function reject(Request $request, Appeal $appeal)
    {
        if (!in_array($appeal->status, ['pending', 'under_review'])) {
            return response()->json([
                'success' => false,
                'message' => 'This appeal has already been processed',
            ], 400);
        }

        $validated = $request->validate([
            'response' => 'required|string|max:2000',
        ]);

        $appeal->update([
            'status' => 'rejected',
            'admin_response' => $validated['response'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'appeal_rejected',
            'target_type' => Appeal::class,
            'target_id' => $appeal->id,
            'details' => [
                'user_id' => $appeal->user_id,
                'appeal_type' => $appeal->appeal_type,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appeal rejected',
        ]);
    }

    public function markUnderReview(Request $request, Appeal $appeal)
    {
        if ($appeal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending appeals can be marked as under review',
            ], 400);
        }

        $appeal->update([
            'status' => 'under_review',
            'reviewed_by' => auth()->id(),
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'appeal_under_review',
            'target_type' => Appeal::class,
            'target_id' => $appeal->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appeal marked as under review',
        ]);
    }

    public function stats()
    {
        $pending = Appeal::where('status', 'pending')->count();
        $underReview = Appeal::where('status', 'under_review')->count();
        $approved = Appeal::where('status', 'approved')->count();
        $rejected = Appeal::where('status', 'rejected')->count();

        $byType = Appeal::select('appeal_type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('appeal_type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'under_review' => $underReview,
                'approved' => $approved,
                'rejected' => $rejected,
                'by_type' => $byType,
            ],
        ]);
    }

    public function types()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'suspension' => 'Account Suspension',
                'post_removal' => 'Post Removal',
                'comment_removal' => 'Comment Removal',
                'warning' => 'Warning Received',
                'other' => 'Other',
            ],
        ]);
    }
}
