<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Services\ImageOptimizationService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MediaController extends Controller
{
    use ApiResponse;

    protected $imageService;

    public function __construct(ImageOptimizationService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Upload and optimize an image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
            'is_public' => 'boolean',
        ]);

        try {
            $media = $this->imageService->upload(
                $request->file('image'),
                Auth::id(),
                [
                    'is_public' => $request->input('is_public', true),
                ]
            );

            return $this->success([
                'media' => $media,
                'message' => 'Image uploaded and optimized successfully',
            ]);

        } catch (\Exception $e) {
            return $this->error('Image upload failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get dynamic resized image
     */
    public function dynamicResize(Request $request, $id)
    {
        $request->validate([
            'width' => 'required|integer|min:50|max:2000',
            'height' => 'nullable|integer|min:50|max:2000',
            'fit' => 'in:crop,contain',
        ]);

        try {
            $url = $this->imageService->dynamicResize(
                $id,
                $request->input('width'),
                $request->input('height'),
                $request->input('fit', 'contain')
            );

            return redirect($url);

        } catch (\Exception $e) {
            return $this->error('Image resize failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user's media library
     */
    public function index(Request $request)
    {
        $query = Media::where('user_id', Auth::id());

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $media = $query->latest()
            ->paginate($request->input('per_page', 20));

        return $this->success($media);
    }

    /**
     * Get specific media
     */
    public function show($id)
    {
        $media = Media::where('user_id', Auth::id())
            ->findOrFail($id);

        // Increment views
        $media->incrementViews();

        return $this->success($media);
    }

    /**
     * Delete media
     */
    public function destroy($id)
    {
        $media = Media::where('user_id', Auth::id())
            ->findOrFail($id);

        try {
            $this->imageService->delete($media);

            return $this->success([
                'message' => 'Media deleted successfully',
            ]);

        } catch (\Exception $e) {
            return $this->error('Media deletion failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get media stats for user
     */
    public function stats()
    {
        $userId = Auth::id();

        $stats = [
            'total_media' => Media::where('user_id', $userId)->count(),
            'total_images' => Media::where('user_id', $userId)->images()->count(),
            'total_videos' => Media::where('user_id', $userId)->videos()->count(),
            'total_size' => Media::where('user_id', $userId)->sum('size'),
            'total_views' => Media::where('user_id', $userId)->sum('views'),
        ];

        return $this->success($stats);
    }
}
