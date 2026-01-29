<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminNotification::where(function ($q) use ($request) {
            $q->whereNull('admin_id')
                ->orWhere('admin_id', $request->user()->id);
        })->notArchived();

        if ($request->unread_only) {
            $query->unread();
        }

        $notifications = $query->latest()->paginate(20);

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = AdminNotification::where(function ($q) use ($request) {
            $q->whereNull('admin_id')
                ->orWhere('admin_id', $request->user()->id);
        })->unread()->notArchived()->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, AdminNotification $notification)
    {
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        AdminNotification::where(function ($q) use ($request) {
            $q->whereNull('admin_id')
                ->orWhere('admin_id', $request->user()->id);
        })->unread()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function archive(Request $request, AdminNotification $notification)
    {
        $notification->update(['archived' => true]);

        return response()->json(['message' => 'Notification archived']);
    }
}
