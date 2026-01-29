<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
        'archived',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'archived' => 'boolean',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeNotArchived($query)
    {
        return $query->where('archived', false);
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }
}
