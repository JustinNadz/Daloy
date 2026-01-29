<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SystemController extends Controller
{
    public function status()
    {
        $dbStatus = $this->checkDatabase();
        $cacheStatus = $this->checkCache();
        $storageStatus = $this->checkStorage();

        return response()->json([
            'success' => true,
            'data' => [
                'database' => $dbStatus,
                'cache' => $cacheStatus,
                'storage' => $storageStatus,
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => now()->toIso8601String(),
                'maintenance_mode' => app()->isDownForMaintenance(),
            ],
        ]);
    }

    public function maintenanceMode(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'message' => 'nullable|string|max:500',
            'secret' => 'nullable|string|max:100',
        ]);

        if ($validated['enabled']) {
            $options = [];
            if (!empty($validated['message'])) {
                $options['--render'] = 'errors::503';
            }
            if (!empty($validated['secret'])) {
                $options['--secret'] = $validated['secret'];
            }

            Artisan::call('down', $options);

            AdminLog::create([
                'admin_id' => auth()->id(),
                'action' => 'maintenance_enabled',
                'details' => ['message' => $validated['message'] ?? null],
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance mode enabled',
            ]);
        } else {
            Artisan::call('up');

            AdminLog::create([
                'admin_id' => auth()->id(),
                'action' => 'maintenance_disabled',
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance mode disabled',
            ]);
        }
    }

    public function clearCache(Request $request)
    {
        $type = $request->get('type', 'all');

        switch ($type) {
            case 'app':
                Artisan::call('cache:clear');
                break;
            case 'config':
                Artisan::call('config:clear');
                break;
            case 'route':
                Artisan::call('route:clear');
                break;
            case 'view':
                Artisan::call('view:clear');
                break;
            default:
                Artisan::call('cache:clear');
                Artisan::call('config:clear');
                Artisan::call('route:clear');
                Artisan::call('view:clear');
        }

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'cache_cleared',
            'details' => ['type' => $type],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully',
        ]);
    }

    public function optimizeSystem(Request $request)
    {
        Artisan::call('optimize');

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'system_optimized',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'System optimized successfully',
        ]);
    }

    public function backupDatabase(Request $request)
    {
        try {
            $filename = 'backup_' . now()->format('Y-m-d_His') . '.sql';
            $path = storage_path('app/backups/' . $filename);

            // Ensure backup directory exists
            if (!is_dir(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Get database config
            $dbHost = config('database.connections.mysql.host');
            $dbName = config('database.connections.mysql.database');
            $dbUser = config('database.connections.mysql.username');
            $dbPass = config('database.connections.mysql.password');

            // Create backup using mysqldump
            $command = sprintf(
                'mysqldump --host=%s --user=%s --password=%s %s > %s',
                escapeshellarg($dbHost),
                escapeshellarg($dbUser),
                escapeshellarg($dbPass),
                escapeshellarg($dbName),
                escapeshellarg($path)
            );

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception('Backup failed');
            }

            AdminLog::create([
                'admin_id' => auth()->id(),
                'action' => 'database_backup',
                'details' => ['filename' => $filename],
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Database backup created successfully',
                'data' => [
                    'filename' => $filename,
                    'size' => filesize($path),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function listBackups()
    {
        $backupPath = storage_path('app/backups');
        $backups = [];

        if (is_dir($backupPath)) {
            $files = scandir($backupPath);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && str_ends_with($file, '.sql')) {
                    $fullPath = $backupPath . '/' . $file;
                    $backups[] = [
                        'filename' => $file,
                        'size' => filesize($fullPath),
                        'created_at' => date('Y-m-d H:i:s', filemtime($fullPath)),
                    ];
                }
            }
        }

        // Sort by date, newest first
        usort($backups, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json([
            'success' => true,
            'data' => $backups,
        ]);
    }

    public function downloadBackup($filename)
    {
        $path = storage_path('app/backups/' . $filename);

        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Backup file not found',
            ], 404);
        }

        return response()->download($path);
    }

    public function deleteBackup(Request $request, $filename)
    {
        $path = storage_path('app/backups/' . $filename);

        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Backup file not found',
            ], 404);
        }

        unlink($path);

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'backup_deleted',
            'details' => ['filename' => $filename],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Backup deleted successfully',
        ]);
    }

    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $latency = round((microtime(true) - $start) * 1000, 2);

            return [
                'status' => 'operational',
                'latency_ms' => $latency,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, true, 10);
            $result = Cache::get($key);
            Cache::forget($key);

            return [
                'status' => $result ? 'operational' : 'error',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    private function checkStorage(): array
    {
        try {
            $storagePath = storage_path();
            $totalSpace = disk_total_space($storagePath);
            $freeSpace = disk_free_space($storagePath);
            $usedSpace = $totalSpace - $freeSpace;
            $usedPercentage = round(($usedSpace / $totalSpace) * 100, 2);

            return [
                'status' => $usedPercentage < 90 ? 'operational' : 'warning',
                'total' => $totalSpace,
                'used' => $usedSpace,
                'free' => $freeSpace,
                'percentage' => $usedPercentage,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
}
