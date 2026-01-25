<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'inviter_id',
        'invitee_id',
        'status',
        'message',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    public function invitee()
    {
        return $this->belongsTo(User::class, 'invitee_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function accept(): void
    {
        $this->update(['status' => 'accepted']);
        
        $this->group->members()->attach($this->invitee_id, [
            'role' => 'member',
            'status' => 'approved',
            'joined_at' => now(),
        ]);
    }

    public function decline(): void
    {
        $this->update(['status' => 'declined']);
    }
}
