<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'post_id',
        'is_pinned',
        'is_announcement',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_announcement' => 'boolean',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
