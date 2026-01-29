<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// User private channel - for notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Conversation private channel - for messages
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Check if user is a member of this conversation
    return $user->conversations()->where('conversations.id', $conversationId)->exists();
});

// Admin notifications channel
Broadcast::channel('admin.notifications', function ($user) {
    // Check if user is an admin
    return $user->admins()->exists();
});

// Presence channel for online users (optional)
Broadcast::channel('online', function ($user) {
    return [
        'id' => $user->id,
        'username' => $user->username,
        'display_name' => $user->display_name,
        'avatar' => $user->avatar_url,
    ];
});
