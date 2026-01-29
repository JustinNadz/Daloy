<?php

namespace Database\Seeders;

use App\Models\AdminRole;
use App\Models\AdminPermission;
use Illuminate\Database\Seeder;

class AdminRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User management
            ['name' => 'users.view', 'description' => 'Can view user list and details'],
            ['name' => 'users.suspend', 'description' => 'Can suspend/unsuspend users'],
            ['name' => 'users.delete', 'description' => 'Can delete users'],
            ['name' => 'users.verify', 'description' => 'Can verify/unverify users'],
            
            // Content management
            ['name' => 'posts.view', 'description' => 'Can view posts'],
            ['name' => 'posts.delete', 'description' => 'Can delete posts'],
            
            // Reports management
            ['name' => 'reports.view', 'description' => 'Can view reports'],
            ['name' => 'reports.resolve', 'description' => 'Can resolve/dismiss reports'],
            
            // Groups management
            ['name' => 'groups.view', 'description' => 'Can view groups'],
            ['name' => 'groups.moderate', 'description' => 'Can suspend/restore groups'],
            ['name' => 'groups.delete', 'description' => 'Can delete groups'],
            
            // Events management
            ['name' => 'events.view', 'description' => 'Can view events'],
            ['name' => 'events.moderate', 'description' => 'Can cancel/suspend events'],
            ['name' => 'events.delete', 'description' => 'Can delete events'],
            
            // Logs
            ['name' => 'logs.view', 'description' => 'Can view audit logs'],
            ['name' => 'logs.export', 'description' => 'Can export audit logs'],
            
            // Settings
            ['name' => 'settings.view', 'description' => 'Can view settings'],
            ['name' => 'settings.edit', 'description' => 'Can edit settings'],
            
            // Admin management
            ['name' => 'admins.view', 'description' => 'Can view admin users'],
            ['name' => 'admins.create', 'description' => 'Can create admin users'],
            ['name' => 'admins.edit', 'description' => 'Can edit admin users'],
            ['name' => 'admins.delete', 'description' => 'Can delete admin users'],
        ];

        foreach ($permissions as $permission) {
            AdminPermission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Create roles
        $superAdminRole = AdminRole::updateOrCreate(
            ['name' => 'super_admin'],
            [
                'description' => 'Full access to all features',
            ]
        );

        $adminRole = AdminRole::updateOrCreate(
            ['name' => 'admin'],
            [
                'description' => 'Can manage users, content, and reports',
            ]
        );

        $moderatorRole = AdminRole::updateOrCreate(
            ['name' => 'moderator'],
            [
                'description' => 'Can moderate content and handle reports',
            ]
        );

        // Assign all permissions to super admin
        $allPermissions = AdminPermission::all();
        $superAdminRole->permissions()->sync($allPermissions->pluck('id'));

        // Assign specific permissions to admin role
        $adminPermissions = AdminPermission::whereIn('name', [
            'users.view', 'users.suspend', 'users.verify',
            'posts.view', 'posts.delete',
            'reports.view', 'reports.resolve',
            'groups.view', 'groups.moderate',
            'events.view', 'events.moderate',
            'logs.view',
            'settings.view',
        ])->get();
        $adminRole->permissions()->sync($adminPermissions->pluck('id'));

        // Assign limited permissions to moderator role
        $moderatorPermissions = AdminPermission::whereIn('name', [
            'users.view', 'users.suspend',
            'posts.view', 'posts.delete',
            'reports.view', 'reports.resolve',
            'groups.view', 'groups.moderate',
            'events.view', 'events.moderate',
        ])->get();
        $moderatorRole->permissions()->sync($moderatorPermissions->pluck('id'));

        // Update existing admin to have super_admin role
        \App\Models\Admin::where('username', 'admin')->update(['role_id' => $superAdminRole->id]);

        $this->command->info('Admin roles and permissions seeded successfully.');
    }
}
