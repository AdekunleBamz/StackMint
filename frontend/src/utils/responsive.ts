/**
 * Responsive Design Utilities
 * Helper functions for responsive breakpoints and media queries
 */

export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.xl - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.xl}px)`,
} as const;

export const useResponsive = () => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < breakpoints.md : false;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.xl;
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= breakpoints.xl : false;
  
  return { isMobile, isTablet, isDesktop };
};
