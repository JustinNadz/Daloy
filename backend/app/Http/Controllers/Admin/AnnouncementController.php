<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::with('creator:id,name,username');

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'scheduled') {
                $query->where('starts_at', '>', now());
            }
        }

        $announcements = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'target' => 'required|in:all,users,verified,new',
            'is_dismissible' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'is_active' => true,
            'created_by' => auth()->id(),
        ]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'announcement_created',
            'target_type' => Announcement::class,
            'target_id' => $announcement->id,
            'details' => ['title' => $announcement->title],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully',
            'data' => $announcement,
        ]);
    }

    public function show(Announcement $announcement)
    {
        $announcement->load('creator:id,name,username');

        return response()->json([
            'success' => true,
            'data' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'type' => 'sometimes|in:info,warning,success,error',
            'target' => 'sometimes|in:all,users,verified,new',
            'is_active' => 'sometimes|boolean',
            'is_dismissible' => 'sometimes|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        $announcement->update($validated);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'announcement_updated',
            'target_type' => Announcement::class,
            'target_id' => $announcement->id,
            'details' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully',
            'data' => $announcement,
        ]);
    }

    public function destroy(Request $request, Announcement $announcement)
    {
        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'announcement_deleted',
            'target_type' => Announcement::class,
            'target_id' => $announcement->id,
            'details' => ['title' => $announcement->title],
            'ip_address' => $request->ip(),
        ]);

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully',
        ]);
    }

    public function toggle(Request $request, Announcement $announcement)
    {
        $announcement->update(['is_active' => !$announcement->is_active]);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => $announcement->is_active ? 'announcement_activated' : 'announcement_deactivated',
            'target_type' => Announcement::class,
            'target_id' => $announcement->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement ' . ($announcement->is_active ? 'activated' : 'deactivated'),
            'data' => $announcement,
        ]);
    }
}
