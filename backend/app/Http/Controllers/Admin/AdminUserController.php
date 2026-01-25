<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Search
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            switch ($status) {
                case 'active':
                    $query->where('is_suspended', false);
                    break;
                case 'suspended':
                    $query->where('is_suspended', true);
                    break;
                case 'verified':
                    $query->where('is_verified', true);
                    break;
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->withCount(['posts', 'followers', 'following'])
            ->paginate($request->get('per_page', 20));

        return response()->json($users);
    }

    public function show(User $user)
    {
        $user->loadCount(['posts', 'followers', 'following']);
        $user->load(['posts' => function ($q) {
            $q->latest()->limit(5);
        }]);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
            'duration' => 'nullable|integer|min:1', // days
        ]);

        $user->update([
            'is_suspended' => true,
            'suspended_at' => now(),
            'suspended_until' => $request->duration ? now()->addDays($request->duration) : null,
            'suspension_reason' => $request->reason,
        ]);

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user_suspended',
            'description' => "Suspended user: {$user->username}",
            'target_type' => User::class,
            'target_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'User suspended successfully',
            'user' => $user,
        ]);
    }

    public function unsuspend(Request $request, User $user)
    {
        $user->update([
            'is_suspended' => false,
            'suspended_at' => null,
            'suspended_until' => null,
            'suspension_reason' => null,
        ]);

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user_unsuspended',
            'description' => "Unsuspended user: {$user->username}",
            'target_type' => User::class,
            'target_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'User unsuspended successfully',
            'user' => $user,
        ]);
    }

    public function verify(Request $request, User $user)
    {
        $user->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user_verified',
            'description' => "Verified user: {$user->username}",
            'target_type' => User::class,
            'target_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'User verified successfully',
            'user' => $user,
        ]);
    }

    public function unverify(Request $request, User $user)
    {
        $user->update([
            'is_verified' => false,
            'verified_at' => null,
        ]);

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user_unverified',
            'description' => "Removed verification from user: {$user->username}",
            'target_type' => User::class,
            'target_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'User verification removed',
            'user' => $user,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        $username = $user->username;

        // Soft delete or hard delete based on policy
        $user->delete();

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user_deleted',
            'description' => "Deleted user: {$username}",
            'target_type' => User::class,
            'target_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
