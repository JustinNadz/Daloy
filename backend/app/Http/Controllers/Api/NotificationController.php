<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->with(['actor', 'notifiable'])
            ->latest()
            ->paginate(20);

        return $this->paginated($notifications->through(fn ($n) => $this->formatNotification($n)));
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $count = $user->notifications()->unread()->count();

        return $this->success(['count' => $count]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();

        if ($notification->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        $notification->markAsRead();

        return $this->success(null, 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        $user->notifications()->unread()->update(['read_at' => now()]);

        return $this->success(null, 'All notifications marked as read');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, Notification $notification)
    {
        $user = $request->user();

        if ($notification->user_id !== $user->id) {
            return $this->error('Unauthorized', 403);
        }

        $notification->delete();

        return $this->success(null, 'Notification deleted');
    }

    /**
     * Clear all notifications.
     */
    public function clearAll(Request $request)
    {
        $user = $request->user();
        $user->notifications()->delete();

        return $this->success(null, 'All notifications cleared');
    }

    private function formatNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'message' => $notification->message,
            'data' => $notification->data,
            'is_read' => $notification->isRead(),
            'actor' => $notification->actor ? [
                'id' => $notification->actor->id,
                'username' => $notification->actor->username,
                'display_name' => $notification->actor->display_name,
                'avatar_url' => $notification->actor->avatar_url,
            ] : null,
            'notifiable_type' => class_basename($notification->notifiable_type),
            'notifiable_id' => $notification->notifiable_id,
            'created_at' => $notification->created_at->toISOString(),
        ];
    }
}
