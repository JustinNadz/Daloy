<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\ModerationAction;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = Group::with(['creator', 'members'])
            ->withCount('members');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->visibility && $request->visibility !== 'all') {
            $query->where('is_private', $request->visibility === 'private');
        }

        $groups = $query->latest()->paginate(20);

        return response()->json($groups);
    }

    public function show(Group $group)
    {
        $group->load(['creator', 'members.user']);
        $group->loadCount('members');

        return response()->json(['data' => $group]);
    }

    public function suspend(Request $request, Group $group)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $group->update(['status' => 'suspended']);

        ModerationAction::create([
            'admin_id' => $request->user()->id,
            'action_type' => 'suspend_group',
            'target_type' => 'group',
            'target_id' => $group->id,
            'reason' => $request->reason,
        ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'suspended_group',
            'description' => "Suspended group: {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Group suspended successfully']);
    }

    public function restore(Request $request, Group $group)
    {
        $group->update(['status' => 'active']);

        ModerationAction::create([
            'admin_id' => $request->user()->id,
            'action_type' => 'restore_content',
            'target_type' => 'group',
            'target_id' => $group->id,
            'reason' => 'Group restored',
        ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'restored_group',
            'description' => "Restored group: {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Group restored successfully']);
    }

    public function destroy(Request $request, Group $group)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        ModerationAction::create([
            'admin_id' => $request->user()->id,
            'action_type' => 'delete_group',
            'target_type' => 'group',
            'target_id' => $group->id,
            'reason' => $request->reason,
        ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'deleted_group',
            'description' => "Deleted group: {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $group->delete();

        return response()->json(['message' => 'Group deleted successfully']);
    }

    public function removeMember(Request $request, Group $group, $memberId)
    {
        $member = GroupMember::where('group_id', $group->id)
            ->where('user_id', $memberId)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'removed_group_member',
            'description' => "Removed member {$memberId} from group: {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $member->delete();

        return response()->json(['message' => 'Member removed successfully']);
    }
}
