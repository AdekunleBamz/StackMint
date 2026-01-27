'use client';

/**
 * ConfirmDialog Component
 * Confirmation dialogs and action sheets
 * @module components/ConfirmDialog
 * @version 1.0.0
 */

import { memo, useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';

// Types
interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  icon?: ReactNode;
  showCancel?: boolean;
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: Omit<DialogOptions, 'showCancel'>) => Promise<void>;
  prompt: (options: DialogOptions & { placeholder?: string; defaultValue?: string }) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}

// Dialog Provider
interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'alert' | 'prompt';
  options: DialogOptions & { placeholder?: string; defaultValue?: string };
  resolve: ((value: boolean | string | null) => void) | null;
}

interface DialogProviderProps {
  children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [inputValue, setInputValue] = useState('');

  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: 'confirm',
        options: { showCancel: true, ...options },
        resolve: resolve as (value: boolean | string | null) => void,
      });
    });
  }, []);

  const alert = useCallback((options: Omit<DialogOptions, 'showCancel'>): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: 'alert',
        options: { ...options, showCancel: false },
        resolve: () => resolve(),
      });
    });
  }, []);

  const prompt = useCallback((options: DialogOptions & { placeholder?: string; defaultValue?: string }): Promise<string | null> => {
    setInputValue(options.defaultValue || '');
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: 'prompt',
        options: { showCancel: true, ...options },
        resolve: resolve as (value: boolean | string | null) => void,
      });
    });
  }, []);

  const handleClose = useCallback((result: boolean | string | null) => {
    dialog?.resolve?.(result);
    setDialog(null);
    setInputValue('');
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    if (dialog?.type === 'prompt') {
      handleClose(inputValue);
    } else {
      handleClose(true);
    }
  }, [dialog, inputValue, handleClose]);

  const handleCancel = useCallback(() => {
    handleClose(dialog?.type === 'prompt' ? null : false);
  }, [dialog, handleClose]);

  // Keyboard handling
  useEffect(() => {
    if (!dialog?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter' && dialog.type !== 'prompt') {
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [dialog, handleConfirm, handleCancel]);

  const variantStyles = {
    default: {
      iconBg: 'bg-purple-600/20',
      iconColor: 'text-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-500',
    },
    danger: {
      iconBg: 'bg-red-600/20',
      iconColor: 'text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-500',
    },
    warning: {
      iconBg: 'bg-yellow-600/20',
      iconColor: 'text-yellow-400',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-500',
    },
    success: {
      iconBg: 'bg-green-600/20',
      iconColor: 'text-green-400',
      buttonBg: 'bg-green-600 hover:bg-green-500',
    },
  };

  const defaultIcons = {
    default: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    danger: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}

      {/* Dialog Modal */}
      {dialog?.isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${variantStyles[dialog.options.variant || 'default'].iconBg} flex items-center justify-center mb-4 mx-auto`}>
                  <span className={variantStyles[dialog.options.variant || 'default'].iconColor}>
                    {dialog.options.icon || defaultIcons[dialog.options.variant || 'default']}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white text-center mb-2">
                  {dialog.options.title}
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center mb-6">
                  {dialog.options.message}
                </p>

                {/* Prompt Input */}
                {dialog.type === 'prompt' && (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dialog.options.placeholder}
                    autoFocus
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-6"
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  />
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {dialog.options.showCancel && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                    >
                      {dialog.options.cancelLabel || 'Cancel'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className={`flex-1 py-3 text-white rounded-xl font-medium transition-colors ${variantStyles[dialog.options.variant || 'default'].buttonBg}`}
                  >
                    {dialog.options.confirmLabel || 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DialogContext.Provider>
  );
}

/**
 * Standalone ConfirmDialog component
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  loading?: boolean;
}

function ConfirmDialogComponent({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    default: 'bg-purple-600 hover:bg-purple-500',
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-500',
    success: 'bg-green-600 hover:bg-green-500',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ActionSheet - bottom sheet with actions
 */
interface ActionSheetAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetAction[];
  onAction: (actionId: string) => void;
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  onAction,
}: ActionSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-md mx-auto bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {title && (
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-sm text-gray-400 text-center">{title}</p>
            </div>
          )}
          <div className="py-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  onAction(action.id);
                  onClose();
                }}
                disabled={action.disabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3
                  transition-colors disabled:opacity-50
                  ${action.variant === 'danger' 
                    ? 'text-red-400 hover:bg-red-600/10' 
                    : 'text-white hover:bg-gray-800'
                  }
                `}
              >
                {action.icon && <span className="w-5 h-5">{action.icon}</span>}
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-gray-400 hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ConfirmDialogComponent);
