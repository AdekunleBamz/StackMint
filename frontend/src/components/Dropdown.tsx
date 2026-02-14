'use client';

/**
 * Dropdown Component
 * Customizable dropdown menu with icons and keyboard navigation
 * @module components/Dropdown
 * @version 1.0.0
 */

import { useState, useRef, useEffect, memo, ReactNode, useCallback } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

function DropdownComponent({
  trigger,
  items,
  align = 'left',
  width = 'md',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Get non-disabled, non-divider items for keyboard nav
  const navigableItems = items.filter(item => !item.disabled && !item.divider);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev < navigableItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev > 0 ? prev - 1 : navigableItems.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < navigableItems.length) {
          const item = navigableItems[focusedIndex];
          item.onClick?.();
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isOpen, focusedIndex, navigableItems]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const widthClasses = {
    auto: 'w-auto',
    sm: 'w-40',
    md: 'w-56',
    lg: 'w-72',
    full: 'w-full',
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={`
            absolute z-50 mt-2 py-1
            bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl shadow-black/40
            animate-fade-in-down
            ${widthClasses[width]}
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div 
                  key={`divider-${index}`} 
                  className="my-1.5 border-t border-gray-700/40" 
                />
              );
            }

            const navigableIndex = navigableItems.findIndex(ni => ni.id === item.id);
            const isFocused = navigableIndex === focusedIndex;

            return (
              <button
                key={item.id}
                role="menuitem"
                tabIndex={isFocused ? 0 : -1}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium
                  transition-all duration-150
                  ${item.disabled 
                    ? 'opacity-40 cursor-not-allowed text-gray-600' 
                    : item.danger
                      ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                      : 'text-gray-200 hover:bg-gray-700/60 hover:text-white'
                  }
                  ${isFocused ? 'bg-purple-500/20 text-white' : ''}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                `}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-500 ml-auto font-mono">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Context Menu - triggered by right-click
 */
interface ContextMenuProps {
  items: DropdownItem[];
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ContextMenu({
  items,
  children,
  disabled = false,
  className = '',
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 py-1 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl min-w-[180px] animate-fade-in"
          style={{ 
            left: position.x, 
            top: position.y,
          }}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div 
                  key={`divider-${index}`} 
                  className="my-1 border-t border-gray-800" 
                />
              );
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                  transition-colors
                  ${item.disabled 
                    ? 'opacity-50 cursor-not-allowed text-gray-500' 
                    : item.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-500">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default memo(DropdownComponent);
