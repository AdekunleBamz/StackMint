'use client';

/**
 * ImageUploader Component
 * Image upload with preview, crop, and validation
 * @module components/ImageUploader
 * @version 1.0.0
 */

import React, { useState, useRef, useCallback } from 'react';

// Icons
const UploadIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Types
export interface UploadedFile {
  file: File;
  preview: string;
  id: string;
  progress?: number;
  error?: string;
}

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  onRemove?: (id: string) => void;
  accept?: string;
  maxSize?: number; // MB
  maxFiles?: number;
  multiple?: boolean;
  aspectRatio?: number;
  minDimensions?: { width: number; height: number };
  value?: UploadedFile[];
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'avatar';
  className?: string;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Generate unique ID
function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ImageUploader({
  onUpload,
  onRemove,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  maxSize = 10,
  maxFiles = 10,
  multiple = false,
  aspectRatio,
  minDimensions,
  value = [],
  disabled = false,
  variant = 'default',
  className = '',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    // Check type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${accept}`;
    }

    // Check size
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }

    // Check dimensions if required
    if (minDimensions) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      return new Promise((resolve) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          if (img.width < minDimensions.width || img.height < minDimensions.height) {
            resolve(`Image must be at least ${minDimensions.width}x${minDimensions.height}px`);
          }
          resolve(null);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve('Failed to load image');
        };
        img.src = objectUrl;
      });
    }

    return null;
  }, [accept, maxSize, minDimensions]);

  // Handle files
  const handleFiles = useCallback(async (fileList: FileList) => {
    setError(null);

    const files = Array.from(fileList);
    
    // Check max files
    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    
    for (const file of files) {
      const error = await validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      validFiles.push(file);
    }

    onUpload(validFiles);
  }, [value.length, maxFiles, validateFile, onUpload]);

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Avatar variant
  if (variant === 'avatar') {
    return (
      <div className={`relative inline-block ${className}`}>
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            w-32 h-32 rounded-full overflow-hidden cursor-pointer
            bg-gray-800 border-2 border-dashed border-gray-600
            hover:border-primary-500 transition-colors
            flex items-center justify-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {value[0] ? (
            <img
              src={value[0].preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon />
          )}
        </div>
        
        {/* Edit badge */}
        <div className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={className}>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <UploadIcon />
          <span>Upload Image</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-gray-700 hover:border-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <UploadIcon />
        <p className="mt-4 text-lg font-semibold text-white">
          Drag & drop your images here
        </p>
        <p className="mt-1 text-sm text-gray-400">
          or <span className="text-primary-400">browse files</span>
        </p>
        <p className="mt-3 text-xs text-gray-500">
          {accept.split(',').map((t) => t.split('/')[1].toUpperCase()).join(', ')} • Max {maxSize}MB
          {minDimensions && ` • Min ${minDimensions.width}×${minDimensions.height}px`}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((file) => (
            <div
              key={file.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-800"
            >
              <img
                src={file.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Progress overlay */}
              {file.progress !== undefined && file.progress < 100 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2 text-sm text-white">{file.progress}%</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {file.error && (
                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center p-2">
                  <p className="text-xs text-white text-center">{file.error}</p>
                </div>
              )}

              {/* Remove button */}
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <CloseIcon />
                </button>
              )}

              {/* File info */}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs text-white truncate">{file.file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
