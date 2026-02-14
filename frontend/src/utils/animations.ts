/**
 * Animation Utilities
 * Reusable animation helper functions and constants
 */

export const animations = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500,
  },
  easing: {
    ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export const generateTransition = (property = 'all', duration = 200, easing = 'ease-in-out') => 
  `${property} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
