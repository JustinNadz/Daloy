<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminSettingsController extends Controller
{
    public function index(Request $request)
    {
        $group = $request->get('group');

        $query = Setting::query();

        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->get()->groupBy('group');

        return response()->json([
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($request->settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }

        // Clear settings cache
        Cache::forget('app_settings');

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'settings_updated',
            'description' => 'Updated application settings',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }

    public function getByKey(string $key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'setting' => $setting,
        ]);
    }

    public function updateByKey(Request $request, string $key)
    {
        $request->validate([
            'value' => 'nullable',
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $request->value]
        );

        // Clear settings cache
        Cache::forget('app_settings');

        // Log action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'setting_updated',
            'description' => "Updated setting: {$key}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Setting updated successfully',
            'setting' => $setting,
        ]);
    }
}
