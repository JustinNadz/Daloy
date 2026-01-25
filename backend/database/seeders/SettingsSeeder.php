<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            ['key' => 'site_name', 'value' => 'Daloy', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'A modern social media platform', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => null, 'group' => 'general'],
            ['key' => 'maintenance_mode', 'value' => 'false', 'group' => 'general'],

            // Content Settings
            ['key' => 'max_post_length', 'value' => '500', 'group' => 'content'],
            ['key' => 'max_media_per_post', 'value' => '4', 'group' => 'content'],
            ['key' => 'allowed_media_types', 'value' => 'image/jpeg,image/png,image/gif,video/mp4', 'group' => 'content'],
            ['key' => 'max_file_size_mb', 'value' => '10', 'group' => 'content'],
            ['key' => 'enable_hashtags', 'value' => 'true', 'group' => 'content'],
            ['key' => 'enable_mentions', 'value' => 'true', 'group' => 'content'],

            // User Settings
            ['key' => 'allow_registration', 'value' => 'true', 'group' => 'users'],
            ['key' => 'require_email_verification', 'value' => 'false', 'group' => 'users'],
            ['key' => 'default_privacy', 'value' => 'public', 'group' => 'users'],
            ['key' => 'allow_private_accounts', 'value' => 'true', 'group' => 'users'],

            // Security Settings
            ['key' => 'max_login_attempts', 'value' => '5', 'group' => 'security'],
            ['key' => 'lockout_duration_minutes', 'value' => '15', 'group' => 'security'],
            ['key' => 'password_min_length', 'value' => '8', 'group' => 'security'],
            ['key' => 'session_lifetime_minutes', 'value' => '120', 'group' => 'security'],

            // Notification Settings
            ['key' => 'enable_email_notifications', 'value' => 'true', 'group' => 'notifications'],
            ['key' => 'enable_push_notifications', 'value' => 'false', 'group' => 'notifications'],

            // Rate Limiting
            ['key' => 'posts_per_hour', 'value' => '30', 'group' => 'rate_limits'],
            ['key' => 'comments_per_hour', 'value' => '60', 'group' => 'rate_limits'],
            ['key' => 'follows_per_hour', 'value' => '100', 'group' => 'rate_limits'],
            ['key' => 'messages_per_hour', 'value' => '100', 'group' => 'rate_limits'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
