'use client';

/**
 * Alert Component
 * Contextual alert messages with various types
 * @module components/Alert
 * @version 1.0.0
 */

import { memo, useState, ReactNode } from 'react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons: Record<AlertType, ReactNode> = {
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const typeStyles: Record<AlertType, { container: string; icon: string; title: string }> = {
  info: {
    container: 'bg-blue-500/10 border-blue-500/30',
    icon: 'text-blue-400',
    title: 'text-blue-300',
  },
  success: {
    container: 'bg-green-500/10 border-green-500/30',
    icon: 'text-green-400',
    title: 'text-green-300',
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30',
    icon: 'text-yellow-400',
    title: 'text-yellow-300',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-400',
    title: 'text-red-300',
  },
};

function AlertComponent({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  action,
  className = '',
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const styles = typeStyles[type];

  return (
    <div
      role="alert"
      className={`
        relative flex gap-3 p-4 rounded-xl border
        ${styles.container}
        ${className}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {icon || icons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-medium mb-1 ${styles.title}`}>
            {title}
          </h4>
        )}
        <div className="text-sm text-gray-300">
          {children}
        </div>
        
        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-3 text-sm font-medium ${styles.title} hover:underline`}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Banner Alert - Full width notification banner
 */
interface BannerProps {
  type?: AlertType;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function Banner({
  type = 'info',
  children,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const bgColors: Record<AlertType, string> = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-600',
  };

  return (
    <div
      role="alert"
      className={`
        flex items-center justify-center gap-4 px-4 py-3
        ${bgColors[type]}
        ${className}
      `}
    >
      <span className={`flex-shrink-0 ${type === 'warning' ? 'text-black' : 'text-white'}`}>
        {icons[type]}
      </span>
      
      <p className={`text-sm font-medium ${type === 'warning' ? 'text-black' : 'text-white'}`}>
        {children}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className={`
            flex-shrink-0 px-3 py-1 text-sm font-medium rounded-full transition-colors
            ${type === 'warning' 
              ? 'bg-black/10 hover:bg-black/20 text-black' 
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
          `}
        >
          {action.label}
        </button>
      )}

      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-lg transition-colors
            ${type === 'warning' 
              ? 'text-black/60 hover:text-black' 
              : 'text-white/60 hover:text-white'
            }
          `}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default memo(AlertComponent);
