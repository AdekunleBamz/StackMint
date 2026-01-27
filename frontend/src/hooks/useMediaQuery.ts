import { useState, useEffect, useCallback } from 'react';

/**
 * useMediaQuery Hook
 * Responsive design utilities with media query matching
 * @module hooks/useMediaQuery
 * @version 1.0.0
 */

/**
 * Check if a media query matches
 * @param query - CSS media query string
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Common breakpoint queries matching Tailwind CSS defaults
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * Hook for common responsive breakpoints
 * @returns Object with boolean values for each breakpoint
 */
export function useBreakpoints() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2Xl = useMediaQuery(breakpoints['2xl']);

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg,
  };
}

/**
 * Check if user prefers reduced motion
 * @returns Whether reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Check if user prefers dark color scheme
 * @returns Whether dark mode is preferred
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Check if device has hover capability
 * @returns Whether the device supports hover
 */
export function useHasHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/**
 * Check if device is touch-capable
 * @returns Whether the device has a coarse pointer (touch)
 */
export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * Get current orientation
 * @returns 'portrait' | 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * Hook for responsive values based on breakpoints
 * @param values - Object with breakpoint keys and values
 * @param defaultValue - Default value when no breakpoint matches
 * @returns The value for the current breakpoint
 */
export function useResponsiveValue<T>(
  values: Partial<Record<keyof typeof breakpoints | 'base', T>>,
  defaultValue: T
): T {
  const { isSm, isMd, isLg, isXl, is2Xl } = useBreakpoints();

  const getValue = useCallback(() => {
    if (is2Xl && values['2xl'] !== undefined) return values['2xl'];
    if (isXl && values.xl !== undefined) return values.xl;
    if (isLg && values.lg !== undefined) return values.lg;
    if (isMd && values.md !== undefined) return values.md;
    if (isSm && values.sm !== undefined) return values.sm;
    if (values.base !== undefined) return values.base;
    return defaultValue;
  }, [is2Xl, isXl, isLg, isMd, isSm, values, defaultValue]);

  return getValue();
}

export default useMediaQuery;
