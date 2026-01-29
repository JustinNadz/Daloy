<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminRole;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Admin::with('role');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role !== 'all') {
            $query->whereHas('role', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        $admins = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $admins,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:admins',
            'email' => 'required|email|unique:admins',
            'password' => ['required', Password::min(8)],
            'role_id' => 'required|exists:admin_roles,id',
        ]);

        $admin = Admin::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'role' => 'admin',
        ]);

        // Log the action
        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'admin_created',
            'target_type' => Admin::class,
            'target_id' => $admin->id,
            'details' => ['username' => $admin->username, 'role_id' => $admin->role_id],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin created successfully',
            'data' => $admin->load('role'),
        ]);
    }

    public function show(Admin $admin)
    {
        return response()->json([
            'success' => true,
            'data' => $admin->load('role'),
        ]);
    }

    public function update(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:admins,username,' . $admin->id,
            'email' => 'sometimes|email|unique:admins,email,' . $admin->id,
            'role_id' => 'sometimes|exists:admin_roles,id',
        ]);

        $admin->update($validated);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'admin_updated',
            'target_type' => Admin::class,
            'target_id' => $admin->id,
            'details' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin updated successfully',
            'data' => $admin->load('role'),
        ]);
    }

    public function updatePassword(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'password' => ['required', Password::min(8), 'confirmed'],
        ]);

        $admin->update([
            'password' => Hash::make($validated['password']),
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'admin_password_changed',
            'target_type' => Admin::class,
            'target_id' => $admin->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    public function destroy(Request $request, Admin $admin)
    {
        // Prevent self-deletion
        if ($admin->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'admin_deleted',
            'target_type' => Admin::class,
            'target_id' => $admin->id,
            'details' => ['username' => $admin->username],
            'ip_address' => $request->ip(),
        ]);

        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin deleted successfully',
        ]);
    }

    public function roles()
    {
        $roles = AdminRole::withCount('admins')->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}
