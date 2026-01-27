'use client';

/**
 * Drawer Component
 * Slide-out panel from edges
 * @module components/Drawer
 * @version 1.0.0
 */

import React, { useEffect, useCallback, useRef } from 'react';

// Types
type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: 'sm' | 'md' | 'lg' | 'full';
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

// Size configurations
const sizeConfig: Record<string, Record<DrawerPosition, string>> = {
  sm: {
    left: 'w-64',
    right: 'w-64',
    top: 'h-48',
    bottom: 'h-48',
  },
  md: {
    left: 'w-80',
    right: 'w-80',
    top: 'h-64',
    bottom: 'h-64',
  },
  lg: {
    left: 'w-96',
    right: 'w-96',
    top: 'h-96',
    bottom: 'h-96',
  },
  full: {
    left: 'w-full max-w-lg',
    right: 'w-full max-w-lg',
    top: 'h-full max-h-96',
    bottom: 'h-full max-h-96',
  },
};

// Position styles
const positionStyles: Record<DrawerPosition, { container: string; open: string; closed: string }> = {
  left: {
    container: 'left-0 top-0 bottom-0',
    open: 'translate-x-0',
    closed: '-translate-x-full',
  },
  right: {
    container: 'right-0 top-0 bottom-0',
    open: 'translate-x-0',
    closed: 'translate-x-full',
  },
  top: {
    container: 'top-0 left-0 right-0',
    open: 'translate-y-0',
    closed: '-translate-y-full',
  },
  bottom: {
    container: 'bottom-0 left-0 right-0',
    open: 'translate-y-0',
    closed: 'translate-y-full',
  },
};

/**
 * Main Drawer Component
 */
export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  children,
  className = '',
  overlayClassName = '',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const positionStyle = positionStyles[position];
  const sizeStyle = sizeConfig[size][position];

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          ${overlayClassName}
        `}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`
          fixed z-50 ${positionStyle.container}
          ${sizeStyle}
          bg-zinc-900 border-zinc-700
          ${position === 'left' ? 'border-r' : ''}
          ${position === 'right' ? 'border-l' : ''}
          ${position === 'top' ? 'border-b' : ''}
          ${position === 'bottom' ? 'border-t' : ''}
          transform transition-transform duration-300 ease-out
          ${isOpen ? positionStyle.open : positionStyle.closed}
          flex flex-col
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            {title && (
              <h2 id="drawer-title" className="text-lg font-semibold text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors ml-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * Filter Drawer - Pre-configured for marketplace filters
 */
interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClear?: () => void;
  onApply?: () => void;
  children: React.ReactNode;
  activeFilterCount?: number;
}

export function FilterDrawer({
  isOpen,
  onClose,
  onClear,
  onApply,
  children,
  activeFilterCount = 0,
}: FilterDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      size="md"
      title={
        activeFilterCount > 0
          ? `Filters (${activeFilterCount})`
          : 'Filters'
      }
    >
      <div className="flex flex-col h-full">
        {/* Filter content */}
        <div className="flex-1 overflow-auto -mx-4 px-4">
          {children}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 mt-4 border-t border-zinc-700 -mx-4 px-4">
          {onClear && (
            <button
              onClick={onClear}
              className="flex-1 py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onApply || onClose}
            className="flex-1 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/**
 * Cart Drawer - Pre-configured for shopping cart
 */
interface CartItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  tokenId?: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem?: (id: string) => void;
  onCheckout?: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      size="md"
      title={`Cart (${items.length})`}
    >
      <div className="flex flex-col h-full">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-zinc-400">Your cart is empty</p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-auto space-y-3 -mx-4 px-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-zinc-800/50 rounded-xl"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    {item.tokenId && (
                      <p className="text-xs text-zinc-500">#{item.tokenId}</p>
                    )}
                    <p className="text-purple-400 font-medium mt-1">
                      {item.price} STX
                    </p>
                  </div>

                  {onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total and checkout */}
            <div className="pt-4 mt-4 border-t border-zinc-700 -mx-4 px-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400">Total</span>
                <span className="text-xl font-bold text-white">{total} STX</span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

/**
 * Menu Drawer - Mobile menu
 */
interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  }>;
}

export function MenuDrawer({ isOpen, onClose, items }: MenuDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      size="sm"
      title="Menu"
    >
      <nav className="space-y-1">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
              onClose();
            }}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            {item.icon && <span className="text-zinc-400">{item.icon}</span>}
            {item.label}
          </a>
        ))}
      </nav>
    </Drawer>
  );
}

export default Drawer;
