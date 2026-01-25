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
        Admin::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'admin@daloy.app',
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        Admin::create([
            'name' => 'Moderator',
            'username' => 'moderator',
            'email' => 'mod@daloy.app',
            'password' => Hash::make('mod123'),
            'role' => 'moderator',
            'is_active' => true,
        ]);
    }
}
