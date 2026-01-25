<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Hashtag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'posts_count',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($hashtag) {
            $hashtag->slug = $hashtag->slug ?? Str::slug($hashtag->name);
        });
    }

    public function posts()
    {
        return $this->belongsToMany(Post::class, 'hashtag_post')->withTimestamps();
    }

    public function scopeTrending($query, $hours = 24)
    {
        return $query->whereHas('posts', function ($q) use ($hours) {
            $q->where('created_at', '>=', now()->subHours($hours));
        })
        ->withCount(['posts' => function ($q) use ($hours) {
            $q->where('created_at', '>=', now()->subHours($hours));
        }])
        ->orderByDesc('posts_count');
    }

    public static function findOrCreateByName(string $name): self
    {
        $name = ltrim($name, '#');
        
        return static::firstOrCreate(
            ['name' => strtolower($name)],
            ['slug' => Str::slug($name)]
        );
    }
}
