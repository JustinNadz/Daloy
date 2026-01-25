<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mention extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'mentioned_by',
        'mentionable_type',
        'mentionable_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mentionedBy()
    {
        return $this->belongsTo(User::class, 'mentioned_by');
    }

    public function mentionable()
    {
        return $this->morphTo();
    }
}
