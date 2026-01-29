<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModerationAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'action_type',
        'target_type',
        'target_id',
        'reason',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function target()
    {
        return $this->morphTo('target', 'target_type', 'target_id');
    }
}
