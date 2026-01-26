'use client';

import { 
  useEffect, 
  useRef, 
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// Types
// ============================================================================

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: ModalSize;
  showClose?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  footer?: ReactNode;
  initialFocus?: boolean;
}

// ============================================================================
// Modal Component
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  preventScroll = true,
  className = '',
  overlayClassName = '',
  footer,
  initialFocus = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnOverlay) {
        onClose();
      }
    },
    [closeOnOverlay, onClose]
  );

  // Prevent scroll when modal is open
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, preventScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen && initialFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal or first focusable element
      requestAnimationFrame(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          (focusable || modalRef.current).focus();
        }
      });
    }

    return () => {
      if (previousActiveElement.current && !isOpen) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, initialFocus]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} bg-gray-800 border border-gray-700/50 rounded-2xl shadow-2xl animate-slide-up ${className}`}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2 
                  id="modal-title" 
                  className="text-xl font-bold text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id="modal-description" 
                  className="mt-1 text-sm text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  if (typeof window === 'undefined') return null;
  
  const portalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, portalRoot);
}

// ============================================================================
// Confirm Modal
// ============================================================================

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10',
      button: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-500/10',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
          <svg className={`w-8 h-8 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 ${styles.button} text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// Alert Modal
// ============================================================================

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'success' | 'error' | 'info';
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
}: AlertModalProps) {
  const variantStyles = {
    success: {
      icon: 'text-green-500',
      iconBg: 'bg-green-500/10',
    },
    error: {
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10',
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
    },
  };

  const icons = {
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
    error: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
          <svg className={`w-8 h-8 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[variant]}
          </svg>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================================
// Input Modal
// ============================================================================

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
  inputType?: 'text' | 'number' | 'email' | 'password';
  isLoading?: boolean;
  validation?: (value: string) => string | null;
}

export function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  placeholder = '',
  defaultValue = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  inputType = 'text',
  isLoading = false,
  validation,
}: InputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = () => {
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    onSubmit(value);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      description={description}
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSubmit();
              }
            }}
            placeholder={placeholder}
            className={`w-full px-4 py-3 bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
          />
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Need to import useState for InputModal
import { useState } from 'react';

// ============================================================================
// useModal Hook
// ============================================================================

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

export default Modal;
