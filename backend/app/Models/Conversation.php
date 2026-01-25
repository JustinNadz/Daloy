<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'avatar',
        'created_by',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['role', 'is_muted', 'last_read_at', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    public function activeParticipants()
    {
        return $this->participants()->whereNull('conversation_participants.left_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->latest();
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    public function isDirect(): bool
    {
        return $this->type === 'direct';
    }

    public function isGroup(): bool
    {
        return $this->type === 'group';
    }

    public function getOtherParticipant(User $user)
    {
        if (!$this->isDirect()) {
            return null;
        }

        return $this->participants()->where('users.id', '!=', $user->id)->first();
    }

    public function unreadCountFor(User $user): int
    {
        $participant = $this->participants()->where('users.id', $user->id)->first();
        
        if (!$participant || !$participant->pivot->last_read_at) {
            return $this->messages()->count();
        }

        return $this->messages()
            ->where('created_at', '>', $participant->pivot->last_read_at)
            ->where('sender_id', '!=', $user->id)
            ->count();
    }

    public static function findOrCreateDirect(User $user1, User $user2): self
    {
        $conversation = static::where('type', 'direct')
            ->whereHas('participants', function ($q) use ($user1) {
                $q->where('users.id', $user1->id);
            })
            ->whereHas('participants', function ($q) use ($user2) {
                $q->where('users.id', $user2->id);
            })
            ->first();

        if (!$conversation) {
            $conversation = static::create([
                'type' => 'direct',
                'created_by' => $user1->id,
            ]);

            $conversation->participants()->attach([
                $user1->id => ['role' => 'member', 'joined_at' => now()],
                $user2->id => ['role' => 'member', 'joined_at' => now()],
            ]);
        }

        return $conversation;
    }
}
