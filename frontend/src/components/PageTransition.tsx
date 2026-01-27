'use client';

/**
 * PageTransition Component
 * Page transitions and loading states
 * @module components/PageTransition
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';

// Types
export type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  className?: string;
}

// Get transition classes
function getTransitionClasses(type: TransitionType, isVisible: boolean): string {
  const baseClasses = 'transition-all';
  
  switch (type) {
    case 'fade':
      return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    case 'slide':
      return `${baseClasses} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`;
    case 'scale':
      return `${baseClasses} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
    case 'slideUp':
      return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;
    case 'slideDown':
      return `${baseClasses} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`;
    default:
      return baseClasses;
  }
}

export function PageTransition({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className = '',
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${getTransitionClasses(type, isVisible)} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Staggered children animation
interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  type?: TransitionType;
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  type = 'slideUp',
  className = '',
  itemClassName = '',
}: StaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          key={index}
          type={type}
          delay={initialDelay + index * staggerDelay}
          className={itemClassName}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  );
}

// Page loading skeleton
interface PageLoadingProps {
  type?: 'default' | 'gallery' | 'profile' | 'details';
  className?: string;
}

export function PageLoading({ type = 'default', className = '' }: PageLoadingProps) {
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`bg-gray-800 animate-pulse rounded-lg ${className}`} />
  );

  if (type === 'gallery') {
    return (
      <div className={`p-6 ${className}`}>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className={className}>
        {/* Banner */}
        <Skeleton className="h-48 md:h-64" />
        
        {/* Profile info */}
        <div className="max-w-6xl mx-auto px-4 -mt-16">
          <div className="flex items-start gap-6">
            <Skeleton className="w-32 h-32 rounded-2xl" />
            <div className="flex-1 pt-8 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className={`p-6 max-w-6xl mx-auto ${className}`}>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <Skeleton className="aspect-square rounded-2xl" />
          
          {/* Details */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default loading
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Progress bar for navigation
interface NavigationProgressProps {
  isLoading: boolean;
  color?: string;
}

export function NavigationProgress({
  isLoading,
  color = 'bg-primary-500',
}: NavigationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      
      // Animate progress
      const timer1 = setTimeout(() => setProgress(30), 100);
      const timer2 = setTimeout(() => setProgress(60), 500);
      const timer3 = setTimeout(() => setProgress(80), 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className={`h-full ${color} transition-all duration-300 ease-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Intersection observer for scroll animations
interface ScrollRevealProps {
  children: React.ReactNode;
  type?: TransitionType;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  type = 'slideUp',
  threshold = 0.1,
  className = '',
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${getTransitionClasses(type, isVisible)} duration-700 ${className}`}
    >
      {children}
    </div>
  );
}

// Shimmer effect component
interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className = '', children }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export default PageTransition;
