<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'description',
        'evidence',
        'status',
        'reviewed_by',
        'resolution_notes',
        'reviewed_at',
    ];

    protected $casts = [
        'evidence' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reportable()
    {
        return $this->morphTo();
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReviewing($query)
    {
        return $query->where('status', 'reviewing');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function markAsReviewing(User $admin): void
    {
        $this->update([
            'status' => 'reviewing',
            'reviewed_by' => $admin->id,
        ]);
    }

    public function resolve(User $admin, string $notes = null): void
    {
        $this->update([
            'status' => 'resolved',
            'reviewed_by' => $admin->id,
            'resolution_notes' => $notes,
            'reviewed_at' => now(),
        ]);
    }

    public function dismiss(User $admin, string $notes = null): void
    {
        $this->update([
            'status' => 'dismissed',
            'reviewed_by' => $admin->id,
            'resolution_notes' => $notes,
            'reviewed_at' => now(),
        ]);
    }
}
