'use client';

/**
 * useKeyboard Hook
 * Keyboard shortcuts and hotkey management
 * @module hooks/useKeyboard
 * @version 1.0.0
 */

import { useEffect, useCallback, useRef } from 'react';

// Types
export interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
  scope?: string;
  enabled?: boolean;
}

// Key mappings
const keyAliases: Record<string, string> = {
  esc: 'Escape',
  escape: 'Escape',
  enter: 'Enter',
  return: 'Enter',
  space: ' ',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
};

// Normalize key
function normalizeKey(key: string): string {
  const lowered = key.toLowerCase();
  return keyAliases[lowered] || key;
}

// Check if event matches hotkey
function matchesHotkey(e: KeyboardEvent, config: HotkeyConfig): boolean {
  const targetKey = normalizeKey(config.key);
  
  // Check modifiers
  if (config.ctrl && !e.ctrlKey) return false;
  if (config.meta && !e.metaKey) return false;
  if (config.shift && !e.shiftKey) return false;
  if (config.alt && !e.altKey) return false;
  
  // Check key
  return e.key === targetKey || e.key.toLowerCase() === targetKey.toLowerCase();
}

// Check if element is editable
function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }
  
  return element.getAttribute('contenteditable') === 'true';
}

/**
 * Hook for single keyboard shortcut
 */
export function useHotkey(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    enabled?: boolean;
    enableOnEditable?: boolean;
  } = {}
) {
  const {
    ctrl = false,
    meta = false,
    shift = false,
    alt = false,
    enabled = true,
    enableOnEditable = false,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in editable element
      if (!enableOnEditable && isEditableElement(document.activeElement)) {
        return;
      }

      const config: HotkeyConfig = {
        key,
        ctrl,
        meta,
        shift,
        alt,
        handler: () => {},
      };

      if (matchesHotkey(e, config)) {
        e.preventDefault();
        handlerRef.current(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrl, meta, shift, alt, enabled, enableOnEditable]);
}

/**
 * Hook for multiple keyboard shortcuts
 */
export function useHotkeys(
  hotkeys: HotkeyConfig[],
  options: { enableOnEditable?: boolean } = {}
) {
  const { enableOnEditable = false } = options;
  const hotkeysRef = useRef(hotkeys);
  hotkeysRef.current = hotkeys;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in editable element
      if (!enableOnEditable && isEditableElement(document.activeElement)) {
        return;
      }

      for (const config of hotkeysRef.current) {
        if (config.enabled === false) continue;
        
        if (matchesHotkey(e, config)) {
          e.preventDefault();
          config.handler(e);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableOnEditable]);
}

/**
 * Hook for escape key
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useHotkey('Escape', handler, { enabled });
}

/**
 * Hook for enter key
 */
export function useEnterKey(
  handler: () => void,
  options: { ctrl?: boolean; enabled?: boolean } = {}
) {
  useHotkey('Enter', handler, options);
}

/**
 * Hook for arrow key navigation
 */
export function useArrowNavigation(options: {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  enabled?: boolean;
} = {}) {
  const { onUp, onDown, onLeft, onRight, enabled = true } = options;

  useHotkeys([
    { key: 'ArrowUp', handler: () => onUp?.() },
    { key: 'ArrowDown', handler: () => onDown?.() },
    { key: 'ArrowLeft', handler: () => onLeft?.() },
    { key: 'ArrowRight', handler: () => onRight?.() },
  ].filter(h => options[`on${h.key.replace('Arrow', '')}` as keyof typeof options]));
}

/**
 * Hook for keyboard-accessible list navigation
 */
export function useListNavigation<T>(
  items: T[],
  options: {
    onSelect?: (item: T, index: number) => void;
    loop?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { onSelect, loop = true, enabled = true } = options;
  const [selectedIndex, setSelectedIndex] = useState(0);

  useHotkeys([
    {
      key: 'ArrowUp',
      handler: () => {
        setSelectedIndex((prev) => {
          if (prev === 0) return loop ? items.length - 1 : 0;
          return prev - 1;
        });
      },
      enabled,
    },
    {
      key: 'ArrowDown',
      handler: () => {
        setSelectedIndex((prev) => {
          if (prev === items.length - 1) return loop ? 0 : prev;
          return prev + 1;
        });
      },
      enabled,
    },
    {
      key: 'Enter',
      handler: () => {
        if (items[selectedIndex]) {
          onSelect?.(items[selectedIndex], selectedIndex);
        }
      },
      enabled,
    },
  ]);

  return {
    selectedIndex,
    setSelectedIndex,
    selectedItem: items[selectedIndex],
  };
}

// Need to import useState
import { useState } from 'react';

/**
 * Hook for command palette (Cmd/Ctrl + K)
 */
export function useCommandPalette(
  commands: Array<{
    id: string;
    label: string;
    shortcut?: string;
    handler: () => void;
  }>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Open with Cmd/Ctrl + K
  useHotkey('k', () => setIsOpen(true), { meta: true });
  useHotkey('k', () => setIsOpen(true), { ctrl: true });

  // Close with Escape
  useEscapeKey(() => {
    setIsOpen(false);
    setSearch('');
  }, isOpen);

  // Filter commands
  const filteredCommands = search
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  const executeCommand = useCallback((id: string) => {
    const command = commands.find((c) => c.id === id);
    if (command) {
      command.handler();
      setIsOpen(false);
      setSearch('');
    }
  }, [commands]);

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    commands: filteredCommands,
    executeCommand,
  };
}

/**
 * Hook for focus trap
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, enabled]);
}

export default useHotkey;
