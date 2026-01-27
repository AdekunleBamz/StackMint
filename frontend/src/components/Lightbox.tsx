'use client';

/**
 * Lightbox Component
 * Full-screen image viewer with navigation and zoom
 * @module components/Lightbox
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface LightboxImage {
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  showThumbnails?: boolean;
  showInfo?: boolean;
  enableZoom?: boolean;
}

export function Lightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  showThumbnails = true,
  showInfo = true,
  enableZoom = true,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'z':
          if (enableZoom) setIsZoomed(!isZoomed);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomed, currentIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
    setIsLoading(true);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setIsLoading(true);
  }, [images.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    if (enableZoom) {
      setIsZoomed(!isZoomed);
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          {showInfo && currentImage.title && (
            <h2 className="text-white font-medium">{currentImage.title}</h2>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableZoom && (
            <button
              onClick={toggleZoom}
              className={`p-2 rounded-lg transition-colors ${
                isZoomed ? 'bg-primary-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isZoomed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                )}
              </svg>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <div
          className={`relative transition-all duration-300 ${
            isZoomed ? 'cursor-zoom-out' : enableZoom ? 'cursor-zoom-in' : ''
          }`}
          onClick={toggleZoom}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <img
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.alt || ''}
            onLoad={() => setIsLoading(false)}
            className={`
              max-h-[70vh] max-w-[90vw] object-contain transition-all duration-300
              ${isLoading ? 'opacity-0' : 'opacity-100'}
              ${isZoomed ? 'scale-200' : 'scale-100'}
            `}
            style={isZoomed ? {
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            } : undefined}
            draggable={false}
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Description */}
      {showInfo && currentImage.description && (
        <div className="p-4 text-center">
          <p className="text-white/70 max-w-2xl mx-auto">{currentImage.description}</p>
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                  setIsLoading(true);
                }}
                className={`
                  relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden
                  border-2 transition-all duration-200
                  ${index === currentIndex 
                    ? 'border-primary-500 scale-110' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={image.src}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage lightbox state
 */
export function useLightbox(images: LightboxImage[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const open = useCallback((index: number = 0) => {
    setInitialIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    initialIndex,
    open,
    close,
    lightboxProps: {
      images,
      isOpen,
      initialIndex,
      onClose: close,
    },
  };
}

export default Lightbox;
