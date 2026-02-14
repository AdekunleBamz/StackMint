/**
 * Progress Bar Component Enhancement
 * Improved visual feedback with gradients and animations
 */

export const progressBarVariants = {
  success: 'bg-gradient-to-r from-green-500 to-green-400',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
  error: 'bg-gradient-to-r from-red-500 to-red-400',
  info: 'bg-gradient-to-r from-blue-500 to-blue-400',
  primary: 'bg-gradient-to-r from-purple-600 to-purple-500',
} as const;

// Enhanced progress animation
export const progressAnimations = {
  indeterminate: 'animate-pulse',
  striped: 'animate-pulse',
  smooth: 'transition-all duration-500 ease-out',
} as const;
