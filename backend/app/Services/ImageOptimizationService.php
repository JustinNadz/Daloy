<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageOptimizationService
{
    protected $manager;
    protected $config;

    public function __construct()
    {
        // Create ImageManager with GD driver
        $this->manager = new ImageManager(new Driver());
        $this->config = config('image');
    }

    /**
     * Upload and optimize an image
     */
    public function upload(UploadedFile $file, $userId, array $options = [])
    {
        // Validate file
        $this->validateImage($file);

        // Generate unique filename
        $filename = $this->generateFilename($file);

        // Store original
        $originalPath = $file->storeAs('images/originals', $filename, 'public');

        // Create media record
        $media = Media::create([
            'user_id' => $userId,
            'type' => 'image',
            'filename' => $filename,
            'original_path' => $originalPath,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'status' => 'processing',
            'is_public' => $options['is_public'] ?? true,
            'metadata' => [
                'original_name' => $file->getClientOriginalName(),
            ],
        ]);

        // Process image variants
        $this->processVariants($media, $file);

        return $media->fresh();
    }

    /**
     * Process image variants (thumbnail, small, medium, large)
     */
    protected function processVariants(Media $media, UploadedFile $file)
    {
        $variants = [];
        $image = $this->manager->read($file->getRealPath());

        // Store original dimensions
        $media->update([
            'dimensions' => [
                'width' => $image->width(),
                'height' => $image->height(),
            ],
        ]);

        foreach ($this->config['sizes'] as $sizeName => $sizeConfig) {
            $variantPath = $this->createVariant($image, $sizeName, $sizeConfig, $media->filename);
            $variants[$sizeName] = $variantPath;

            // Also create WebP version if enabled
            if ($this->config['webp_enabled']) {
                $webpPath = $this->createWebPVariant($image, $sizeName, $sizeConfig, $media->filename);
                $variants[$sizeName . '_webp'] = $webpPath;
            }
        }

        // Update media with variants
        $media->update([
            'variants' => $variants,
            'is_optimized' => true,
            'optimization_progress' => 100,
            'status' => 'ready',
        ]);
    }

    /**
     * Create a resized variant
     */
    protected function createVariant($image, $sizeName, $sizeConfig, $filename)
    {
        $resized = clone $image;

        // Apply resize based on fit type
        if ($sizeConfig['fit'] === 'crop') {
            $resized->cover($sizeConfig['width'], $sizeConfig['height']);
        } else {
            $resized->scale(
                width: $sizeConfig['width'],
                height: $sizeConfig['height']
            );
        }

        // Encode with quality
        $encoded = $resized->toJpeg(quality: $this->config['quality']['jpeg']);

        // Generate path
        $path = "images/{$sizeName}/" . pathinfo($filename, PATHINFO_FILENAME) . '.jpg';

        // Store
        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }

    /**
     * Create WebP variant
     */
    protected function createWebPVariant($image, $sizeName, $sizeConfig, $filename)
    {
        $resized = clone $image;

        // Apply resize
        if ($sizeConfig['fit'] === 'crop') {
            $resized->cover($sizeConfig['width'], $sizeConfig['height']);
        } else {
            $resized->scale(
                width: $sizeConfig['width'],
                height: $sizeConfig['height']
            );
        }

        // Encode as WebP
        $encoded = $resized->toWebp(quality: $this->config['quality']['webp']);

        // Generate path
        $path = "images/{$sizeName}/" . pathinfo($filename, PATHINFO_FILENAME) . '.webp';

        // Store
        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }

    /**
     * Dynamic resize - generate size on demand
     */
    public function dynamicResize($mediaId, $width, $height = null, $fit = 'contain')
    {
        $media = Media::findOrFail($mediaId);

        if (!$media->isImage()) {
            throw new \Exception('Media is not an image');
        }

        // Generate cache key
        $cacheKey = "dynamic_{$width}x{$height}_{$fit}";

        // Check if already exists in variants
        if (isset($media->variants[$cacheKey])) {
            return Storage::disk('public')->url($media->variants[$cacheKey]);
        }

        // Load original image
        $originalPath = Storage::disk('public')->path($media->original_path);
        $image = $this->manager->read($originalPath);

        // Resize
        $height = $height ?? $width; // Square if height not provided

        if ($fit === 'crop') {
            $image->cover($width, $height);
        } else {
            $image->scale(width: $width, height: $height);
        }

        // Encode
        $encoded = $image->toJpeg(quality: $this->config['quality']['jpeg']);

        // Store
        $path = "images/dynamic/{$cacheKey}_" . $media->filename;
        Storage::disk('public')->put($path, (string) $encoded);

        // Update media variants
        $variants = $media->variants ?? [];
        $variants[$cacheKey] = $path;
        $media->update(['variants' => $variants]);

        return Storage::disk('public')->url($path);
    }

    /**
     * Delete image and all variants
     */
    public function delete(Media $media)
    {
        // Delete original
        Storage::disk('public')->delete($media->original_path);

        // Delete all variants
        if ($media->variants) {
            foreach ($media->variants as $variantPath) {
                Storage::disk('public')->delete($variantPath);
            }
        }

        // Delete media record
        $media->delete();
    }

    /**
     * Validate uploaded image
     */
    protected function validateImage(UploadedFile $file)
    {
        $maxSize = $this->config['max_size'] * 1024 * 1024; // Convert MB to bytes

        if ($file->getSize() > $maxSize) {
            throw new \Exception("Image size exceeds maximum of {$this->config['max_size']}MB");
        }

        if (!in_array($file->getMimeType(), $this->config['allowed_types'])) {
            throw new \Exception('Invalid image type');
        }
    }

    /**
     * Generate unique filename
     */
    protected function generateFilename(UploadedFile $file)
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }
}
