<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'reply_to_id',
        'content',
        'type',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replyTo()
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function replies()
    {
        return $this->hasMany(Message::class, 'reply_to_id');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }

    public function readBy()
    {
        return $this->belongsToMany(User::class, 'message_reads')
            ->withPivot('read_at');
    }

    public function isReadBy(User $user): bool
    {
        return $this->reads()->where('user_id', $user->id)->exists();
    }

    public function markAsReadBy(User $user): void
    {
        if (!$this->isReadBy($user) && $this->sender_id !== $user->id) {
            $this->reads()->create([
                'user_id' => $user->id,
                'read_at' => now(),
            ]);
        }
    }
}
