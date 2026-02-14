/**
 * Accessibility Utilities
 * Helper functions for WCAG compliant interactive components
 */

export const ariaLabels = {
  close: 'Close modal',
  menu: 'Toggle menu',
  search: 'Search',
  submit: 'Submit form',
  loading: 'Loading',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
} as const;

export const keyboardKeys = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const;

export const createAriaLabel = (label: string, additional?: string) => 
  additional ? `${label} - ${additional}` : label;

export const isFocusableElement = (element: HTMLElement) => {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  return focusableTags.includes(element.tagName) || element.hasAttribute('tabindex');
};
