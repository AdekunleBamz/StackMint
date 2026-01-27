'use client';

/**
 * Popover Component
 * Floating popover for additional content
 * @module components/Popover
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Types
type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  triggerType?: 'click' | 'hover';
  offset?: number;
  showArrow?: boolean;
  closeOnContentClick?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Main Popover Component
 */
export function Popover({
  trigger,
  content,
  placement = 'bottom',
  triggerType = 'click',
  offset = 8,
  showArrow = true,
  closeOnContentClick = false,
  disabled = false,
  className = '',
  contentClassName = '',
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - contentRect.height - offset;
        left = triggerRect.left + scrollX + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + offset;
        left = triggerRect.left + scrollX + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left + scrollX - contentRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + scrollX + offset;
        break;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + contentRect.width > viewportWidth - 8) {
      left = viewportWidth - contentRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + contentRect.height > viewportHeight + scrollY - 8) {
      top = viewportHeight + scrollY - contentRect.height - 8;
    }

    setPosition({ top, left });
  }, [placement, offset]);

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isOpen, calculatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen || triggerType !== 'click') return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, triggerType]);

  // Handle click trigger
  const handleClick = () => {
    if (disabled) return;
    if (triggerType === 'click') {
      setIsOpen(!isOpen);
    }
  };

  // Handle hover trigger
  const handleMouseEnter = () => {
    if (disabled || triggerType !== 'hover') return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (triggerType !== 'hover') return;
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  // Handle content click
  const handleContentClick = () => {
    if (closeOnContentClick) {
      setIsOpen(false);
    }
  };

  // Arrow styles
  const arrowStyles: Record<PopoverPlacement, string> = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
      >
        {trigger}
      </div>

      {/* Portal-like content */}
      {isOpen && (
        <div
          ref={contentRef}
          onClick={handleContentClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`
            fixed z-50 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl
            animate-fadeIn
            ${contentClassName}
          `}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {content}

          {/* Arrow */}
          {showArrow && (
            <div
              className={`
                absolute w-0 h-0 border-[6px] border-zinc-800
                ${arrowStyles[placement]}
              `}
            />
          )}
        </div>
      )}
    </>
  );
}

/**
 * Info Popover - For additional information
 */
interface InfoPopoverProps {
  content: React.ReactNode;
  className?: string;
}

export function InfoPopover({ content, className = '' }: InfoPopoverProps) {
  return (
    <Popover
      trigger={
        <button className="p-1 text-zinc-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      }
      content={
        <div className="p-3 max-w-xs text-sm text-zinc-300">
          {content}
        </div>
      }
      triggerType="hover"
      className={className}
    />
  );
}

/**
 * User Popover - Shows user profile preview
 */
interface UserPopoverProps {
  user: {
    address: string;
    name?: string;
    avatar?: string;
    verified?: boolean;
    stats?: {
      items: number;
      collections: number;
      followers: number;
    };
  };
  children: React.ReactNode;
  className?: string;
}

export function UserPopover({ user, children, className = '' }: UserPopoverProps) {
  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <Popover
      trigger={children}
      triggerType="hover"
      content={
        <div className="w-64 p-4">
          <div className="flex items-start gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-white truncate">
                  {user.name || truncateAddress(user.address)}
                </span>
                {user.verified && (
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {truncateAddress(user.address)}
              </p>
            </div>
          </div>

          {user.stats && (
            <div className="flex gap-4 mt-4 pt-3 border-t border-zinc-700">
              <div className="text-center">
                <p className="text-white font-medium">{user.stats.items}</p>
                <p className="text-xs text-zinc-500">Items</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">{user.stats.collections}</p>
                <p className="text-xs text-zinc-500">Collections</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">{user.stats.followers}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </div>
            </div>
          )}

          <button className="w-full mt-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors">
            View Profile
          </button>
        </div>
      }
      className={className}
    />
  );
}

/**
 * Action Popover - Menu of actions
 */
interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionPopoverProps {
  actions: ActionItem[];
  trigger?: React.ReactNode;
  placement?: PopoverPlacement;
  className?: string;
}

export function ActionPopover({
  actions,
  trigger,
  placement = 'bottom',
  className = '',
}: ActionPopoverProps) {
  const defaultTrigger = (
    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button>
  );

  return (
    <Popover
      trigger={trigger || defaultTrigger}
      placement={placement}
      closeOnContentClick
      content={
        <div className="py-1 min-w-[160px]">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                w-full px-4 py-2 text-left text-sm flex items-center gap-2
                transition-colors
                ${action.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white hover:bg-zinc-700'
                }
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      }
      className={className}
    />
  );
}

/**
 * Share Popover
 */
interface SharePopoverProps {
  url: string;
  title?: string;
  className?: string;
}

export function SharePopover({ url, title = 'Share', className = '' }: SharePopoverProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
  };

  const shareActions = [
    {
      name: 'Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <Popover
      trigger={
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      }
      content={
        <div className="p-4 w-64">
          <h4 className="text-white font-medium mb-3">{title}</h4>

          <div className="flex gap-2 mb-3">
            {shareActions.map((action) => (
              <a
                key={action.name}
                href={action.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-zinc-700 text-white text-center text-sm rounded-lg hover:bg-zinc-600 transition-colors"
              >
                {action.name}
              </a>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-white truncate"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      }
      className={className}
    />
  );
}

export default Popover;
