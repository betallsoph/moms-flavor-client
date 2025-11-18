/**
 * ImageUpload Component
 * 
 * Component cho phép user upload ảnh lên Naver Object Storage.
 * 
 * Features:
 * - File picker với drag & drop
 * - Image preview trước khi upload
 * - Progress indicator
 * - File validation
 * - Error handling
 * 
 * Usage:
 * <ImageUpload
 *   folder="recipes"
 *   onUploadComplete={(url) => console.log(url)}
 *   maxSizeMB={5}
 * />
 */

'use client';

import { useState, useRef } from 'react';
import { auth } from '@/libs/firebase';

interface ImageUploadProps {
  /** Folder để organize files */
  folder: 'recipes' | 'diary';
  
  /** Callback khi upload thành công */
  onUploadComplete: (imageUrl: string) => void;
  
  /** Kích thước tối đa (MB) */
  maxSizeMB?: number;
  
  /** Custom label cho button */
  label?: string;
  
  /** Disable upload button */
  disabled?: boolean;
}

export default function ImageUpload({
  folder,
  onUploadComplete,
  maxSizeMB = 5,
  label = 'Chọn ảnh',
  disabled = false,
}: ImageUploadProps) {
  // State management
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setProgress(0);

    try {
      // 1. Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)');
      }

      // 2. Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(`Kích thước file tối đa ${maxSizeMB}MB`);
      }

      // 3. Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 4. Get user ID
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Bạn cần đăng nhập để upload ảnh');
      }

      // 5. Upload to Naver via API
      setUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('userId', userId);

      setProgress(30);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setProgress(100);

      // 6. Success! Call callback với URL
      console.log('✅ Upload success:', data.imageUrl);
      onUploadComplete(data.imageUrl);

      // 7. Reset preview và input để có thể upload lại
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * Handle drag & drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      // Trigger file input change
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  /**
   * Clear preview
   */
  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-lg p-6
          ${uploading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-orange-400'}
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'}
          transition-colors
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading || disabled}
          className="hidden"
          id="image-upload"
        />
        
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          {!preview ? (
            <>
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-sm text-gray-600 font-medium mb-1">
                {label}
              </p>
              <p className="text-xs text-gray-500">
                hoặc kéo thả ảnh vào đây
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, WEBP, GIF • Tối đa {maxSizeMB}MB
              </p>
            </>
          ) : null}
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
          />
          {!uploading && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Đang upload...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Upload thất bại</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
