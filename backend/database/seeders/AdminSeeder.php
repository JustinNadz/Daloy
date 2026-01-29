<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'admin@daloy.app'],
            [
                'name' => 'Admin',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        Admin::updateOrCreate(
            ['email' => 'mod@daloy.app'],
            [
                'name' => 'Moderator',
                'username' => 'moderator',
                'password' => Hash::make('mod123'),
                'role' => 'moderator',
                'is_active' => true,
            ]
        );
    }
}
