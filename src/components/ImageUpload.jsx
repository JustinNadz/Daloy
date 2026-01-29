import React, { useState, useCallback } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services';

const ImageUpload = ({ onUploadComplete, maxSize = 10, isPublic = true }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(null);
    const [uploadedMedia, setUploadedMedia] = useState(null);
    const { toast } = useToast();

    const handleFileSelect = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload an image file',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (in MB)
        if (file.size > maxSize * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: `Maximum file size is ${maxSize}MB`,
                variant: 'destructive',
            });
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Upload
        await uploadImage(file);
    }, [maxSize]);

    const uploadImage = async (file) => {
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('is_public', isPublic ? '1' : '0');

        try {
            // Simulate progress (since Axios doesn't provide upload progress easily with Bearer token)
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const response = await api.post('/media/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            clearInterval(progressInterval);
            setProgress(100);

            const media = response.data.data.media;
            setUploadedMedia(media);

            toast({
                title: 'Upload successful',
                description: 'Image optimized and uploaded',
            });

            if (onUploadComplete) {
                onUploadComplete(media);
            }
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: error.response?.data?.message || 'Failed to upload image',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    const clearUpload = () => {
        setPreview(null);
        setUploadedMedia(null);
        setProgress(0);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!preview && (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to {maxSize}MB</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            )}

            {/* Preview & Progress */}
            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                    />

                    {/* Progress Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                                <p className="text-white text-sm">{progress}% Uploaded</p>
                                <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Overlay */}
                    {uploadedMedia && !uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                <p className="text-white font-semibold">Upload Complete!</p>
                                <p className="text-gray-300 text-sm">{uploadedMedia.filename}</p>
                            </div>
                        </div>
                    )}

                    {/* Clear Button */}
                    <button
                        onClick={clearUpload}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Info */}
            {uploadedMedia && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Image Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-600">Size:</p>
                            <p className="font-medium">{(uploadedMedia.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Dimensions:</p>
                            <p className="font-medium">
                                {uploadedMedia.dimensions?.width} x {uploadedMedia.dimensions?.height}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Variants:</p>
                            <p className="font-medium">{Object.keys(uploadedMedia.variants || {}).length}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Optimized:</p>
                            <p className="font-medium">{uploadedMedia.is_optimized ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
