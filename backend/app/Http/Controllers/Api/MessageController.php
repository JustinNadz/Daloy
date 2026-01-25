<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Get user's conversations.
     */
    public function conversations(Request $request)
    {
        $user = $request->user();

        $conversations = $user->conversations()
            ->with(['participants', 'latestMessage.sender'])
            ->whereNull('conversation_participants.left_at')
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return $this->paginated($conversations->through(fn ($c) => $this->formatConversation($c, $user)));
    }

    /**
     * Get or create a direct conversation.
     */
    public function startConversation(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $otherUser = User::findOrFail($validated['user_id']);

        if ($otherUser->id === $user->id) {
            return $this->error('Cannot start conversation with yourself', 400);
        }

        if ($user->hasBlocked($otherUser) || $otherUser->hasBlocked($user)) {
            return $this->error('Cannot message this user', 403);
        }

        $conversation = Conversation::findOrCreateDirect($user, $otherUser);

        return $this->success([
            'conversation' => $this->formatConversation($conversation, $user),
        ]);
    }

    /**
     * Get messages in a conversation.
     */
    public function messages(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        if (!$conversation->participants()->where('users.id', $user->id)->exists()) {
            return $this->error('Unauthorized', 403);
        }

        $messages = $conversation->messages()
            ->with(['sender', 'media', 'replyTo.sender'])
            ->latest()
            ->paginate(50);

        // Update last read
        $conversation->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        return $this->paginated($messages->through(fn ($m) => $this->formatMessage($m, $user)));
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        if (!$conversation->participants()->where('users.id', $user->id)->exists()) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'content' => ['required_without:media', 'string', 'max:2000'],
            'reply_to_id' => ['nullable', 'exists:messages,id'],
            'media' => ['sometimes', 'array', 'max:10'],
            'media.*' => ['file', 'mimes:jpeg,png,jpg,gif,mp4,webm,pdf,doc,docx', 'max:25600'],
        ]);

        DB::beginTransaction();
        try {
            $message = $conversation->messages()->create([
                'sender_id' => $user->id,
                'content' => $validated['content'] ?? '',
                'reply_to_id' => $validated['reply_to_id'] ?? null,
                'type' => 'text',
            ]);

            // Handle media
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $index => $file) {
                    $path = $file->store('messages/' . $conversation->id, 'public');
                    $mimeType = $file->getMimeType();

                    $type = 'file';
                    if (str_starts_with($mimeType, 'image/')) $type = 'image';
                    if (str_starts_with($mimeType, 'video/')) $type = 'video';

                    $message->media()->create([
                        'user_id' => $user->id,
                        'type' => $type,
                        'filename' => basename($path),
                        'original_filename' => $file->getClientOriginalName(),
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'mime_type' => $mimeType,
                        'size' => $file->getSize(),
                        'order' => $index,
                    ]);

                    if ($type !== 'text') {
                        $message->update(['type' => $type]);
                    }
                }
            }

            // Update conversation
            $conversation->update(['last_message_at' => now()]);

            // Notify other participants
            foreach ($conversation->participants as $participant) {
                if ($participant->id !== $user->id) {
                    $participant->notifications()->create([
                        'actor_id' => $user->id,
                        'type' => 'message',
                        'notifiable_type' => Message::class,
                        'notifiable_id' => $message->id,
                        'message' => $user->display_name . ' sent you a message',
                    ]);
                }
            }

            DB::commit();

            $message->load(['sender', 'media', 'replyTo.sender']);

            return $this->success(
                $this->formatMessage($message, $user),
                'Message sent',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to send message: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Edit a message.
     */
    public function editMessage(Request $request, Message $message)
    {
        $user = $request->user();

        if ($message->sender_id !== $user->id) {
            return $this->error('You can only edit your own messages', 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $message->update([
            'content' => $validated['content'],
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return $this->success($this->formatMessage($message->fresh(), $user), 'Message edited');
    }

    /**
     * Delete a message.
     */
    public function deleteMessage(Request $request, Message $message)
    {
        $user = $request->user();

        if ($message->sender_id !== $user->id) {
            return $this->error('You can only delete your own messages', 403);
        }

        $message->delete();

        return $this->success(null, 'Message deleted');
    }

    /**
     * Create a group conversation.
     */
    public function createGroup(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'participants' => ['required', 'array', 'min:1', 'max:50'],
            'participants.*' => ['exists:users,id'],
        ]);

        $participantIds = collect($validated['participants'])
            ->filter(fn ($id) => $id != $user->id)
            ->unique()
            ->values();

        if ($participantIds->isEmpty()) {
            return $this->error('Please add at least one participant', 400);
        }

        DB::beginTransaction();
        try {
            $conversation = Conversation::create([
                'type' => 'group',
                'name' => $validated['name'],
                'created_by' => $user->id,
                'last_message_at' => now(),
            ]);

            // Add creator as admin
            $conversation->participants()->attach($user->id, [
                'role' => 'admin',
                'joined_at' => now(),
            ]);

            // Add other participants
            foreach ($participantIds as $participantId) {
                $conversation->participants()->attach($participantId, [
                    'role' => 'member',
                    'joined_at' => now(),
                ]);
            }

            // Create system message
            $conversation->messages()->create([
                'sender_id' => $user->id,
                'content' => $user->display_name . ' created the group',
                'type' => 'system',
            ]);

            DB::commit();

            return $this->success([
                'conversation' => $this->formatConversation($conversation->fresh(['participants']), $user),
            ], 'Group created', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create group', 500);
        }
    }

    /**
     * Leave a conversation.
     */
    public function leaveConversation(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        if ($conversation->isDirect()) {
            return $this->error('Cannot leave a direct conversation', 400);
        }

        $conversation->participants()->updateExistingPivot($user->id, [
            'left_at' => now(),
        ]);

        // Add system message
        $conversation->messages()->create([
            'sender_id' => $user->id,
            'content' => $user->display_name . ' left the group',
            'type' => 'system',
        ]);

        return $this->success(null, 'Left conversation');
    }

    /**
     * Mute/unmute conversation.
     */
    public function toggleMute(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        $participant = $conversation->participants()->where('users.id', $user->id)->first();

        if (!$participant) {
            return $this->error('Unauthorized', 403);
        }

        $isMuted = !$participant->pivot->is_muted;
        
        $conversation->participants()->updateExistingPivot($user->id, [
            'is_muted' => $isMuted,
        ]);

        return $this->success([
            'is_muted' => $isMuted,
        ], $isMuted ? 'Conversation muted' : 'Conversation unmuted');
    }

    private function formatConversation(Conversation $conversation, User $currentUser): array
    {
        $otherParticipants = $conversation->participants
            ->filter(fn ($p) => $p->id !== $currentUser->id);

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversation->isDirect() 
                ? $otherParticipants->first()?->display_name 
                : $conversation->name,
            'avatar' => $conversation->isDirect()
                ? $otherParticipants->first()?->avatar_url
                : $conversation->avatar,
            'participants' => $otherParticipants->map(fn ($p) => [
                'id' => $p->id,
                'username' => $p->username,
                'display_name' => $p->display_name,
                'avatar_url' => $p->avatar_url,
            ])->values(),
            'last_message' => $conversation->latestMessage ? [
                'content' => $conversation->latestMessage->content,
                'sender' => $conversation->latestMessage->sender->display_name,
                'created_at' => $conversation->latestMessage->created_at->toISOString(),
            ] : null,
            'unread_count' => $conversation->unreadCountFor($currentUser),
            'is_muted' => (bool) $conversation->participants
                ->where('id', $currentUser->id)
                ->first()?->pivot?->is_muted,
            'last_message_at' => $conversation->last_message_at?->toISOString(),
        ];
    }

    private function formatMessage(Message $message, User $currentUser): array
    {
        return [
            'id' => $message->id,
            'content' => $message->content,
            'type' => $message->type,
            'is_edited' => $message->is_edited,
            'edited_at' => $message->edited_at?->toISOString(),
            'is_mine' => $message->sender_id === $currentUser->id,
            'sender' => [
                'id' => $message->sender->id,
                'username' => $message->sender->username,
                'display_name' => $message->sender->display_name,
                'avatar_url' => $message->sender->avatar_url,
            ],
            'media' => $message->media->map(fn ($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'url' => $m->url,
                'filename' => $m->original_filename,
            ]),
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'content' => $message->replyTo->content,
                'sender' => $message->replyTo->sender->display_name,
            ] : null,
            'created_at' => $message->created_at->toISOString(),
        ];
    }
}
