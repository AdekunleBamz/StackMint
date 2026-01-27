'use client';

/**
 * FileUpload Component
 * Drag-and-drop file upload for NFT images
 * @module components/FileUpload
 * @version 1.0.0
 */

import { useState, useRef, useCallback, memo } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
  preview?: boolean;
  className?: string;
}

function FileUploadComponent({
  onFileSelect,
  accept = 'image/*',
  maxSize = 10, // 10MB default
  label = 'Upload file',
  description = 'PNG, JPG, GIF, or SVG up to 10MB',
  preview = true,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate and process file
  const processFile = useCallback(
    (selectedFile: File) => {
      setError(null);

      // Check file size
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return;
      }

      // Check file type
      if (accept !== '*' && !selectedFile.type.match(accept.replace('*', '.*'))) {
        setError('Invalid file type');
        return;
      }

      setFile(selectedFile);
      onFileSelect(selectedFile);

      // Create preview for images
      if (preview && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    },
    [accept, maxSize, onFileSelect, preview]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    [processFile]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    [processFile]
  );

  // Clear selected file
  const handleClear = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Upload area */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center
            w-full h-64 border-2 border-dashed rounded-2xl
            transition-all duration-200 cursor-pointer
            ${isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload icon */}
          <div className={`
            w-16 h-16 mb-4 rounded-2xl flex items-center justify-center
            ${isDragging ? 'bg-purple-500/20' : 'bg-gray-700/50'}
            transition-colors
          `}>
            <svg
              className={`w-8 h-8 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Text */}
          <p className="text-white font-medium mb-1">
            {isDragging ? 'Drop your file here' : 'Drag & drop your file'}
          </p>
          <p className="text-sm text-gray-400 mb-3">or</p>
          <span className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
            Browse files
          </span>
          <p className="text-xs text-gray-500 mt-3">{description}</p>
        </div>
      ) : (
        /* Preview area */
        <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-800">
          {previewUrl && (
            <div className="aspect-square relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* File info */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🖼️</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Replace file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

export default memo(FileUploadComponent);
