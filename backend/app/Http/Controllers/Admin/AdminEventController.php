<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\ModerationAction;
use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminEventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['user', 'rsvps'])
            ->withCount(['rsvps as attendees_count' => function ($q) {
                $q->where('status', 'going');
            }])
            ->withCount(['rsvps as interested_count' => function ($q) {
                $q->where('status', 'interested');
            }]);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $events = $query->latest()->paginate(20);

        return response()->json($events);
    }

    public function show(Event $event)
    {
        $event->load(['user', 'rsvps.user']);
        $event->loadCount(['rsvps as attendees_count' => function ($q) {
            $q->where('status', 'going');
        }]);

        return response()->json(['data' => $event]);
    }

    public function cancel(Request $request, Event $event)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $event->update(['status' => 'cancelled']);

        ModerationAction::create([
            'admin_id' => $request->user()->id,
            'action_type' => 'delete_event',
            'target_type' => 'event',
            'target_id' => $event->id,
            'reason' => $request->reason,
        ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'cancelled_event',
            'description' => "Cancelled event: {$event->title}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Event cancelled successfully']);
    }

    public function suspend(Request $request, Event $event)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $event->update(['status' => 'suspended']);

        ModerationAction::create([
            'admin_id' => $request->user()->id,
            'action_type' => 'delete_event',
            'target_type' => 'event',
            'target_id' => $event->id,
            'reason' => $request->reason,
        ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'suspended_event',
            'description' => "Suspended event: {$event->title}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Event suspended successfully']);
    }

    public function restore(Request $request, Event $event)
    {
        $event->update(['status' => 'active']);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'restored_event',
            'description' => "Restored event: {$event->title}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Event restored successfully']);
    }

    public function destroy(Request $request, Event $event)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        ModerationAction::create([
            'admin_id' => $request->user()->id,
            'action_type' => 'delete_event',
            'target_type' => 'event',
            'target_id' => $event->id,
            'reason' => $request->reason,
        ]);

        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'deleted_event',
            'description' => "Deleted event: {$event->title}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
