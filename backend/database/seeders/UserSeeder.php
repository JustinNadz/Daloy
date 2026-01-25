<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Follow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo users
        $users = [
            [
                'display_name' => 'Marcus Chen',
                'username' => 'marcus_flow',
                'email' => 'marcus@example.com',
                'password' => Hash::make('password123'),
                'bio' => 'Full-stack developer | Coffee enthusiast | Building cool stuff',
                'location' => 'San Francisco, CA',
                'website' => 'https://marcus.dev',
                'is_verified' => true,
            ],
            [
                'display_name' => 'Elena Cruz',
                'username' => 'elena_cruz',
                'email' => 'elena@example.com',
                'password' => Hash::make('password123'),
                'bio' => 'Travel blogger | Surfer | Island life 🌴',
                'location' => 'Siargao, Philippines',
                'is_verified' => true,
            ],
            [
                'display_name' => 'Tech Daily',
                'username' => 'techdaily',
                'email' => 'tech@example.com',
                'password' => Hash::make('password123'),
                'bio' => 'Your daily dose of tech news and updates',
                'is_verified' => true,
            ],
            [
                'display_name' => 'Music Vibes',
                'username' => 'musicvibes',
                'email' => 'music@example.com',
                'password' => Hash::make('password123'),
                'bio' => 'Curating the best beats 🎧',
            ],
            [
                'display_name' => 'John Doe',
                'username' => 'johndoe',
                'email' => 'john@example.com',
                'password' => Hash::make('password123'),
                'bio' => 'Just a regular user testing Daloy',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Create sample posts
        $posts = [
            [
                'user_id' => 2, // Elena
                'content' => "Just arrived in Siargao! The waves are incredible today. Can't wait to hit the surf 🌊 #IslandLife #Surfing",
            ],
            [
                'user_id' => 3, // Tech Daily
                'content' => "The new framework updates are mind-blowing. The performance gains we're seeing in production are over 40%. Huge props to the open source community! ⚡ #Tech #OpenSource",
            ],
            [
                'user_id' => 4, // Music Vibes
                'content' => 'Current mood: Late night coding sessions with lo-fi beats. 🎧🌙 #LoFi #Coding',
            ],
            [
                'user_id' => 1, // Marcus
                'content' => "Just shipped a new feature! It's amazing what you can build with modern web technologies. React + Laravel is such a powerful combo 🚀 #WebDev #React #Laravel",
            ],
            [
                'user_id' => 2, // Elena
                'content' => "Sunset sessions are the best sessions. Nothing beats watching the sun go down after a day of catching waves 🌅 #GoldenHour #BeachLife",
            ],
        ];

        foreach ($posts as $postData) {
            Post::create($postData);
        }

        // Create follow relationships
        $follows = [
            ['follower_id' => 1, 'following_id' => 2, 'status' => 'accepted'],
            ['follower_id' => 1, 'following_id' => 3, 'status' => 'accepted'],
            ['follower_id' => 2, 'following_id' => 1, 'status' => 'accepted'],
            ['follower_id' => 2, 'following_id' => 4, 'status' => 'accepted'],
            ['follower_id' => 3, 'following_id' => 1, 'status' => 'accepted'],
            ['follower_id' => 5, 'following_id' => 1, 'status' => 'accepted'],
            ['follower_id' => 5, 'following_id' => 2, 'status' => 'accepted'],
            ['follower_id' => 5, 'following_id' => 3, 'status' => 'accepted'],
        ];

        foreach ($follows as $followData) {
            Follow::create($followData);
        }
    }
}
