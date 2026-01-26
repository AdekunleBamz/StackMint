'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip Component
 * Accessible tooltip with multiple placements and triggers
 * @module components/Tooltip
 * @version 2.0.0
 */

// ============================================================================
// Constants
// ============================================================================

/** Default hover delay before showing tooltip */
const DEFAULT_DELAY = 200;

/** Default offset from trigger element */
const DEFAULT_OFFSET = 8;

/** Arrow size in pixels */
const ARROW_SIZE = 6;

/** Z-index for tooltip layer */
const TOOLTIP_Z_INDEX = 9999;

// ============================================================================
// Types
// ============================================================================

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
type TooltipTrigger = 'hover' | 'click' | 'focus';

/**
 * Tooltip visibility state
 */
type TooltipVisibility = 'hidden' | 'showing' | 'visible' | 'hiding';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger | TooltipTrigger[];
  delay?: number;
  offset?: number;
  disabled?: boolean;
  className?: string;
  arrow?: boolean;
  maxWidth?: number | string;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

// ============================================================================
// Tooltip Component
// ============================================================================

export function Tooltip({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  delay = 200,
  offset = 8,
  disabled = false,
  className = '',
  arrow = true,
  maxWidth = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let finalPlacement = placement;
    let top = 0;
    let left = 0;

    // Calculate initial position based on placement
    const positions: Record<TooltipPlacement, { top: number; left: number }> = {
      top: {
        top: triggerRect.top + scrollY - tooltipRect.height - offset,
        left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
      },
      bottom: {
        top: triggerRect.bottom + scrollY + offset,
        left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
      },
      left: {
        top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.left + scrollX - tooltipRect.width - offset,
      },
      right: {
        top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
        left: triggerRect.right + scrollX + offset,
      },
    };

    // Check if tooltip fits in viewport, flip if needed
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const pos = positions[placement];
    
    // Flip vertical
    if (placement === 'top' && pos.top < scrollY) {
      finalPlacement = 'bottom';
    } else if (placement === 'bottom' && pos.top + tooltipRect.height > scrollY + viewport.height) {
      finalPlacement = 'top';
    }
    
    // Flip horizontal
    if (placement === 'left' && pos.left < scrollX) {
      finalPlacement = 'right';
    } else if (placement === 'right' && pos.left + tooltipRect.width > scrollX + viewport.width) {
      finalPlacement = 'left';
    }

    const finalPos = positions[finalPlacement];
    top = finalPos.top;
    left = finalPos.left;

    // Constrain to viewport
    left = Math.max(scrollX + 8, Math.min(left, scrollX + viewport.width - tooltipRect.width - 8));
    top = Math.max(scrollY + 8, Math.min(top, scrollY + viewport.height - tooltipRect.height - 8));

    setPosition({ top, left, placement: finalPlacement });
  }, [placement, offset]);

  // Show tooltip
  const show = useCallback(() => {
    if (disabled) return;
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  }, [delay, disabled]);

  // Hide tooltip
  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  // Toggle for click trigger
  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      // Recalculate on scroll/resize
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close on outside click for click trigger
  useEffect(() => {
    if (!triggers.includes('click') || !isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        hide();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, triggers, hide]);

  // Build event handlers
  const triggerProps: Record<string, any> = {};

  if (triggers.includes('hover')) {
    triggerProps.onMouseEnter = show;
    triggerProps.onMouseLeave = hide;
  }

  if (triggers.includes('click')) {
    triggerProps.onClick = toggle;
  }

  if (triggers.includes('focus')) {
    triggerProps.onFocus = show;
    triggerProps.onBlur = hide;
  }

  // Arrow styles
  const arrowStyles: Record<TooltipPlacement, CSSProperties> = {
    top: {
      bottom: -4,
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
    },
    bottom: {
      top: -4,
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
    },
    left: {
      right: -4,
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
    },
    right: {
      left: -4,
      top: '50%',
      transform: 'translateY(-50%) rotate(45deg)',
    },
  };

  const tooltipContent = isVisible && position && (
    <div
      ref={tooltipRef}
      className={`fixed z-[100] px-3 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg shadow-xl animate-fade-in ${className}`}
      style={{
        top: position.top,
        left: position.left,
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
      }}
      role="tooltip"
    >
      {content}
      {arrow && (
        <div
          className="absolute w-2 h-2 bg-gray-900 border-gray-700"
          style={{
            ...arrowStyles[position.placement],
            borderWidth: position.placement === 'top' || position.placement === 'left' ? '0 1px 1px 0' : '1px 0 0 1px',
          }}
        />
      )}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        {...triggerProps}
      >
        {children}
      </div>
      {typeof window !== 'undefined' &&
        createPortal(tooltipContent, document.getElementById('tooltip-root') || document.body)}
    </>
  );
}

// ============================================================================
// Info Tooltip (with icon)
// ============================================================================

interface InfoTooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({
  content,
  placement = 'top',
  className = '',
  iconClassName = '',
}: InfoTooltipProps) {
  return (
    <Tooltip content={content} placement={placement} className={className}>
      <button
        type="button"
        className={`inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full ${iconClassName}`}
        aria-label="More information"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

// ============================================================================
// Truncated Text with Tooltip
// ============================================================================

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  tooltipPlacement?: TooltipPlacement;
}

export function TruncatedText({
  text,
  maxLength = 20,
  className = '',
  tooltipPlacement = 'top',
}: TruncatedTextProps) {
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  const truncated = `${text.slice(0, maxLength)}...`;

  return (
    <Tooltip content={text} placement={tooltipPlacement}>
      <span className={`cursor-help ${className}`}>{truncated}</span>
    </Tooltip>
  );
}

// ============================================================================
// Address Tooltip (for wallet addresses)
// ============================================================================

interface AddressTooltipProps {
  address: string;
  className?: string;
  showCopy?: boolean;
  placement?: TooltipPlacement;
}

export function AddressTooltip({
  address,
  className = '',
  showCopy = true,
  placement = 'top',
}: AddressTooltipProps) {
  const [copied, setCopied] = useState(false);

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const tooltipContent = (
    <div className="space-y-2">
      <p className="font-mono text-xs break-all">{address}</p>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy address
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <Tooltip 
      content={tooltipContent} 
      placement={placement}
      trigger={['hover', 'click']}
      maxWidth={350}
    >
      <span className={`font-mono cursor-pointer hover:text-orange-400 transition-colors ${className}`}>
        {shortAddress}
      </span>
    </Tooltip>
  );
}

// ============================================================================
// Copy Tooltip
// ============================================================================

interface CopyTooltipProps {
  textToCopy: string;
  children: ReactNode;
  successMessage?: string;
  className?: string;
}

export function CopyTooltip({
  textToCopy,
  children,
  successMessage = 'Copied!',
  className = '',
}: CopyTooltipProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Tooltip 
      content={copied ? successMessage : 'Click to copy'} 
      placement="top"
    >
      <button
        onClick={handleClick}
        className={`cursor-pointer ${className}`}
        type="button"
      >
        {children}
      </button>
    </Tooltip>
  );
}

export default Tooltip;
