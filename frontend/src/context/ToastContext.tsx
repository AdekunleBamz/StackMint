'use client';

/**
 * ToastContext
 * Global context for toast notification management
 * @module ToastContext
 * @version 2.1.0
 */

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import Toast from '@/components/Toast';

// Toast positioning and type definitions
type ToastPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Animation timing constants
const TOAST_ENTER_DURATION_MS = 300;
const TOAST_EXIT_DURATION_MS = 200;

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => Promise<T>;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION: ToastPosition = 'bottom-right';

// Toast ID generation prefix
const TOAST_ID_PREFIX = 'toast';

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  limit?: number;
}

export function ToastProvider({ 
  children, 
  position = DEFAULT_POSITION,
  limit = TOAST_LIMIT 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((message: string, type: ToastType, options?: ToastOptions): string => {
    const id = generateId();
    const newToast: ToastItem = { 
      id, 
      message, 
      type,
      title: options?.title,
      duration: options?.duration ?? DEFAULT_DURATION,
      action: options?.action,
      persistent: options?.persistent,
    };
    
    setToasts((prev) => {
      const updated = [...prev, newToast];
      // Remove oldest toasts if exceeding limit
      return updated.slice(-limit);
    });

    return id;
  }, [generateId, limit]);

  const success = useCallback((message: string, options?: ToastOptions) => 
    showToast(message, 'success', options), [showToast]);
  
  const error = useCallback((message: string, options?: ToastOptions) => 
    showToast(message, 'error', options), [showToast]);
  
  const info = useCallback((message: string, options?: ToastOptions) => 
    showToast(message, 'info', options), [showToast]);
  
  const warning = useCallback((message: string, options?: ToastOptions) => 
    showToast(message, 'warning', options), [showToast]);

  const promise = useCallback(async <T,>(
    promiseToResolve: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ): Promise<T> => {
    const loadingId = showToast(messages.loading, 'info', { persistent: true });
    
    try {
      const result = await promiseToResolve;
      dismiss(loadingId);
      showToast(messages.success, 'success');
      return result;
    } catch (err) {
      dismiss(loadingId);
      showToast(messages.error, 'error');
      throw err;
    }
  }, [showToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const positionClasses = useMemo(() => {
    const positions: Record<ToastPosition, string> = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };
    return positions[position];
  }, [position]);

  const contextValue = useMemo(() => ({
    showToast,
    success,
    error,
    info,
    warning,
    promise,
    dismiss,
    dismissAll,
  }), [showToast, success, error, info, warning, promise, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div 
        className={`fixed ${positionClasses} z-50 flex flex-col gap-2 pointer-events-none`}
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast, index) => (
          <div 
            key={toast.id}
            className="pointer-events-auto animate-fade-in-up"
            style={{ 
              animationDelay: `${index * 50}ms`,
              zIndex: 50 + index,
            }}
          >
            <Toast 
              message={toast.message} 
              type={toast.type} 
              title={toast.title}
              duration={toast.persistent ? undefined : toast.duration}
              action={toast.action}
              onClose={() => dismiss(toast.id)} 
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
