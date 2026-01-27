import { useEffect, useRef, RefObject, useCallback } from 'react';

/**
 * useClickOutside Hook
 * Detect clicks outside of an element for dropdowns and modals
 * @module hooks/useClickOutside
 * @version 1.0.0
 */

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Hook to detect clicks outside of an element
 * @param handler - Callback when click outside is detected
 * @param enabled - Whether the listener is active (default: true)
 * @returns Ref to attach to the element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const handlerRef = useRef<Handler>(handler);

  // Update handler ref
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;

      // Do nothing if clicking ref's element or descendant elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [enabled]);

  return ref;
}

/**
 * Hook to detect clicks outside of multiple elements
 * @param refs - Array of refs to check against
 * @param handler - Callback when click outside all refs is detected
 * @param enabled - Whether the listener is active
 */
export function useClickOutsideMultiple(
  refs: RefObject<HTMLElement | null>[],
  handler: Handler,
  enabled: boolean = true
): void {
  const handlerRef = useRef<Handler>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the refs
      const isInside = refs.some((ref) => {
        const el = ref.current;
        return el && el.contains(event.target as Node);
      });

      if (!isInside) {
        handlerRef.current(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, enabled]);
}

/**
 * Hook for escape key press detection
 * @param handler - Callback when escape is pressed
 * @param enabled - Whether the listener is active
 */
export function useEscapeKey(
  handler: () => void,
  enabled: boolean = true
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handlerRef.current();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled]);
}

/**
 * Combined hook for dropdown/modal behavior
 * @param onClose - Callback when modal should close
 * @param enabled - Whether the listeners are active
 * @returns Ref to attach to the modal/dropdown
 */
export function useModalBehavior<T extends HTMLElement = HTMLElement>(
  onClose: () => void,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useClickOutside<T>(onClose, enabled);
  useEscapeKey(onClose, enabled);
  return ref;
}

/**
 * Hook for focus trap inside a modal
 * @param enabled - Whether focus trap is active
 * @returns Ref to attach to the container
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || event.key !== 'Tab' || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement) return;

    if (event.shiftKey) {
      // Shift + Tab: focus last element if on first
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: focus first element if on last
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Focus first focusable element on mount
  useEffect(() => {
    if (!enabled || !ref.current) return;

    const firstFocusable = ref.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    firstFocusable?.focus();
  }, [enabled]);

  return ref;
}

export default useClickOutside;
