import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

/**
 * useIntersectionObserver Hook
 * Detect element visibility for lazy loading and animations
 * @module hooks/useIntersectionObserver
 * @version 1.0.0
 */

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
}

interface UseIntersectionObserverReturn {
  ref: RefObject<Element | null>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook for observing element intersection with viewport
 * @param options - IntersectionObserver options
 * @returns Object with ref to attach, intersection state, and entry
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    freezeOnceVisible = false,
    onChange,
  } = options;

  const elementRef = useRef<Element | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = useRef(false);

  const isIntersecting = entry?.isIntersecting ?? false;

  // Freeze if already visible and freeze option is set
  useEffect(() => {
    if (freezeOnceVisible && isIntersecting) {
      frozen.current = true;
    }
  }, [freezeOnceVisible, isIntersecting]);

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Skip if frozen
    if (frozen.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);
        onChange?.(observerEntry);
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, onChange]);

  return {
    ref: elementRef,
    isIntersecting,
    entry,
  };
}

/**
 * Hook for lazy loading content when it comes into view
 * @param rootMargin - Margin around root (default: '200px' for preloading)
 * @returns Object with ref and whether content should load
 */
export function useLazyLoad(rootMargin: string = '200px') {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin,
    freezeOnceVisible: true,
  });

  return {
    ref,
    shouldLoad: isIntersecting,
  };
}

/**
 * Hook for triggering animations when element comes into view
 * @param options - Animation trigger options
 * @returns Object with ref and animation state
 */
export function useAnimateOnScroll(options: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
} = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: once,
  });

  return {
    ref,
    isVisible: isIntersecting,
    animationClass: isIntersecting ? 'animate-fade-in-up' : 'opacity-0 translate-y-4',
  };
}

/**
 * Hook for infinite scroll loading
 * @param onLoadMore - Callback when sentinel is visible
 * @param options - Observer options
 * @returns Ref to attach to sentinel element
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  options: {
    rootMargin?: string;
    enabled?: boolean;
  } = {}
) {
  const { rootMargin = '400px', enabled = true } = options;
  const loadMoreRef = useRef(onLoadMore);

  // Update callback ref
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const handleChange = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting && enabled) {
        loadMoreRef.current();
      }
    },
    [enabled]
  );

  const { ref } = useIntersectionObserver({
    rootMargin,
    onChange: handleChange,
  });

  return ref;
}

export default useIntersectionObserver;
