'use client';

import { useState, useEffect, memo, useCallback } from 'react';

/**
 * Toast Component
 * Displays notification messages with auto-dismiss and actions
 * @module components/Toast
 * @version 2.1.0
 */

// Toast duration constants
const DEFAULT_DURATION = 4000;
const MIN_DURATION = 1000;
const MAX_DURATION = 10000;

// Animation timing constants
const ENTER_ANIMATION_DURATION = 300;
const EXIT_ANIMATION_DURATION = 200;

/**
 * Toast position configuration type
 */
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  pauseOnHover?: boolean;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-900/90',
    icon: 'bg-green-500 text-white',
    border: 'border-green-500/30',
  },
  error: {
    bg: 'bg-red-900/90',
    icon: 'bg-red-500 text-white',
    border: 'border-red-500/30',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    icon: 'bg-yellow-500 text-black',
    border: 'border-yellow-500/30',
  },
  info: {
    bg: 'bg-purple-900/90',
    icon: 'bg-purple-500 text-white',
    border: 'border-purple-500/30',
  },
};

export default function Toast({ 
  message, 
  type, 
  title,
  duration = 5000,
  onClose,
  action
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const style = styles[type];
  
  // Type-specific emojis for visual flair
  const typeEmojis: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 max-w-sm w-full ${style.bg} backdrop-blur-xl border ${style.border} rounded-xl shadow-2xl overflow-hidden z-50 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 animate-slide-up'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${style.icon} flex items-center justify-center shadow-lg`}>
            {icons[type]}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-semibold text-white mb-0.5 flex items-center gap-2">
                <span>{typeEmojis[type]}</span>
                {title}
              </p>
            )}
            <p className="text-sm text-gray-200">{message}</p>
            
            {/* Action button */}
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  handleClose();
                }}
                className="mt-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors underline-offset-2 hover:underline"
              >
                {action.label} →
              </button>
            )}
          </div>
          
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all hover:rotate-90 duration-200"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-black/30">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-purple-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
