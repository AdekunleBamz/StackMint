'use client';

/**
 * ImageGallery Component
 * NFT image gallery with lightbox
 * @module components/ImageGallery
 * @version 1.0.0
 */

import { memo, useState, useCallback, useEffect } from 'react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  enableLightbox?: boolean;
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const aspectClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: '',
};

function ImageGalleryComponent({
  images,
  columns = 4,
  gap = 'md',
  aspectRatio = 'square',
  enableLightbox = true,
  className = '',
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const openLightbox = useCallback((index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
    }
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  const handleImageLoad = useCallback((id: string) => {
    setIsLoading(prev => ({ ...prev, [id]: false }));
  }, []);

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`
              relative overflow-hidden rounded-xl bg-gray-800/50
              ${aspectClasses[aspectRatio]}
              ${enableLightbox ? 'cursor-pointer group' : ''}
            `}
            onClick={() => openLightbox(index)}
          >
            {/* Loading placeholder */}
            {isLoading[image.id] !== false && (
              <div className="absolute inset-0 animate-pulse bg-gray-800" />
            )}

            {/* Image */}
            <img
              src={image.thumbnail || image.src}
              alt={image.alt}
              onLoad={() => handleImageLoad(image.id)}
              className={`
                w-full h-full object-cover transition-transform duration-300
                ${enableLightbox ? 'group-hover:scale-105' : ''}
                ${isLoading[image.id] !== false ? 'opacity-0' : 'opacity-100'}
              `}
            />

            {/* Hover overlay */}
            {enableLightbox && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); }}
                  className={`
                    w-12 h-12 rounded-lg overflow-hidden transition-all
                    ${index === lightboxIndex ? 'ring-2 ring-purple-500 scale-110' : 'opacity-50 hover:opacity-100'}
                  `}
                >
                  <img
                    src={image.thumbnail || image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * NFT Image with zoom
 */
interface NFTImageViewerProps {
  src: string;
  alt: string;
  enableZoom?: boolean;
  className?: string;
}

export function NFTImageViewer({
  src,
  alt,
  enableZoom = true,
  className = '',
}: NFTImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }, [isZoomed]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-gray-800/50
        ${enableZoom ? 'cursor-zoom-in' : ''}
        ${className}
      `}
      onClick={() => enableZoom && setIsZoomed(!isZoomed)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover transition-transform duration-200
          ${isZoomed ? 'scale-200' : ''}
        `}
        style={isZoomed ? {
          transformOrigin: `${position.x}% ${position.y}%`,
        } : undefined}
      />

      {/* Zoom indicator */}
      {enableZoom && !isZoomed && (
        <div className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-lg text-white/70">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Masonry Gallery Layout
 */
interface MasonryGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export function MasonryGallery({
  images,
  columns = 3,
  gap = 16,
  className = '',
}: MasonryGalleryProps) {
  // Distribute images across columns
  const columnArrays: GalleryImage[][] = Array.from({ length: columns }, () => []);
  
  images.forEach((image, index) => {
    columnArrays[index % columns].push(image);
  });

  return (
    <div 
      className={`flex ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {columnArrays.map((column, colIndex) => (
        <div 
          key={colIndex} 
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-xl bg-gray-800/50 group cursor-pointer"
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-sm font-medium">{image.alt}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Carousel Gallery
 */
interface CarouselGalleryProps {
  images: GalleryImage[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function CarouselGallery({
  images,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
}: CarouselGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="w-full flex-shrink-0">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full aspect-video object-cover"
            />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full transition-all
                ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ImageGalleryComponent);
