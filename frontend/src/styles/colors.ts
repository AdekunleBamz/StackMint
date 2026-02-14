/**
 * Theme Color System
 * Centralized color palette for consistent UI
 */

export const colors = {
  // Primary colors
  primary: {
    50: '#f8f5ff',
    100: '#f0ebff',
    200: '#ddd5ff',
    300: '#c9b5ff',
    400: '#a878ff',
    500: '#8558ff',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Semantic colors
  success: {
    light: '#d1fae5',
    main: '#10b981',
    dark: '#047857',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1d4ed8',
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0e27',
  },
} as const;

// Color variants for use in components
export const colorVariants = {
  primary: 'from-purple-500 to-purple-600',
  success: 'from-green-500 to-green-600',
  warning: 'from-yellow-500 to-yellow-600',
  error: 'from-red-500 to-red-600',
  info: 'from-blue-500 to-blue-600',
} as const;
