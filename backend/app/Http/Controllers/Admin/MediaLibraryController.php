<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MediaLibraryController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::with('user:id,username,display_name');

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('filename', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($uq) use ($request) {
                        $uq->where('username', 'like', "%{$request->search}%");
                    });
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');

        $media = $query->orderBy($sortBy, $sortOrder)->paginate(24);

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }

    public function show(Media $media)
    {
        $media->load([
            'user:id,username,display_name,avatar_url',
            'post:id,content,created_at',
        ]);

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }

    public function destroy(Request $request, Media $media)
    {
        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'media_deleted',
            'target_type' => Media::class,
            'target_id' => $media->id,
            'details' => [
                'filename' => $media->filename,
                'type' => $media->type,
                'user_id' => $media->user_id,
                'reason' => $request->reason,
            ],
            'ip_address' => $request->ip(),
        ]);

        // Delete file from storage
        if ($media->path && Storage::exists($media->path)) {
            Storage::delete($media->path);
        }

        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully',
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'exists:media,id',
            'reason' => 'nullable|string',
        ]);

        $mediaItems = Media::whereIn('id', $validated['media_ids'])->get();

        foreach ($mediaItems as $media) {
            AdminLog::create([
                'admin_id' => auth()->id(),
                'action' => 'media_deleted',
                'target_type' => Media::class,
                'target_id' => $media->id,
                'details' => [
                    'bulk_delete' => true,
                    'reason' => $validated['reason'] ?? null,
                ],
                'ip_address' => $request->ip(),
            ]);

            if ($media->path && Storage::exists($media->path)) {
                Storage::delete($media->path);
            }
        }

        Media::whereIn('id', $validated['media_ids'])->delete();

        return response()->json([
            'success' => true,
            'message' => count($validated['media_ids']) . ' media items deleted successfully',
        ]);
    }

    public function stats()
    {
        $totalMedia = Media::count();
        $totalSize = Media::sum('size');
        $byType = Media::select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(size) as size'))
            ->groupBy('type')
            ->get();

        $recentUploads = Media::where('created_at', '>=', now()->subDay())->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalMedia,
                'total_size' => $totalSize,
                'by_type' => $byType,
                'recent_uploads' => $recentUploads,
            ],
        ]);
    }

    public function storageInfo()
    {
        $usedSpace = Media::sum('size');
        $totalSpace = config('filesystems.disks.public.max_size', 10737418240); // 10GB default

        return response()->json([
            'success' => true,
            'data' => [
                'used' => $usedSpace,
                'total' => $totalSpace,
                'percentage' => round(($usedSpace / $totalSpace) * 100, 2),
            ],
        ]);
    }
}
