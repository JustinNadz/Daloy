<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VerificationRequest;
use App\Models\User;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class VerificationRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = VerificationRequest::with([
            'user:id,username,display_name,avatar_url,is_verified',
            'reviewer:id,name,username',
        ]);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('username', 'like', "%{$search}%")
                            ->orWhere('display_name', 'like', "%{$search}%");
                    });
            });
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function show(VerificationRequest $verificationRequest)
    {
        $verificationRequest->load([
            'user',
            'reviewer:id,name,username',
        ]);

        return response()->json([
            'success' => true,
            'data' => $verificationRequest,
        ]);
    }

    public function approve(Request $request, VerificationRequest $verificationRequest)
    {
        if ($verificationRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been processed',
            ], 400);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // Update verification request
        $verificationRequest->update([
            'status' => 'approved',
            'admin_notes' => $validated['notes'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        // Verify the user
        $verificationRequest->user->update(['is_verified' => true]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'verification_approved',
            'target_type' => VerificationRequest::class,
            'target_id' => $verificationRequest->id,
            'details' => [
                'user_id' => $verificationRequest->user_id,
                'username' => $verificationRequest->user->username,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Verification request approved',
        ]);
    }

    public function reject(Request $request, VerificationRequest $verificationRequest)
    {
        if ($verificationRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been processed',
            ], 400);
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $verificationRequest->update([
            'status' => 'rejected',
            'admin_notes' => $validated['notes'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'verification_rejected',
            'target_type' => VerificationRequest::class,
            'target_id' => $verificationRequest->id,
            'details' => [
                'user_id' => $verificationRequest->user_id,
                'reason' => $validated['notes'],
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Verification request rejected',
        ]);
    }

    public function stats()
    {
        $pending = VerificationRequest::where('status', 'pending')->count();
        $approved = VerificationRequest::where('status', 'approved')->count();
        $rejected = VerificationRequest::where('status', 'rejected')->count();
        $total = VerificationRequest::count();

        $byCategory = VerificationRequest::select('category')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('category')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
                'total' => $total,
                'by_category' => $byCategory,
            ],
        ]);
    }

    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'influencer' => 'Influencer',
                'brand' => 'Brand/Business',
                'public_figure' => 'Public Figure',
                'journalist' => 'Journalist',
                'government' => 'Government Official',
                'organization' => 'Organization',
                'other' => 'Other',
            ],
        ]);
    }
}
