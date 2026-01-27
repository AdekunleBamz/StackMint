'use client';

/**
 * useNotifications Hook
 * Manages in-app notifications and toast messages
 * @module hooks/useNotifications
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';

/** Notification types */
type NotificationType = 'success' | 'error' | 'warning' | 'info';

/** Notification position */
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

interface UseNotificationsOptions {
  /** Default duration in ms */
  defaultDuration?: number;
  /** Maximum notifications to show */
  maxNotifications?: number;
  /** Default position */
  position?: NotificationPosition;
}

interface UseNotificationsReturn {
  /** Current notifications */
  notifications: Notification[];
  /** Add a notification */
  notify: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  /** Add a success notification */
  success: (title: string, message?: string) => string;
  /** Add an error notification */
  error: (title: string, message?: string) => string;
  /** Add a warning notification */
  warning: (title: string, message?: string) => string;
  /** Add an info notification */
  info: (title: string, message?: string) => string;
  /** Dismiss a notification */
  dismiss: (id: string) => void;
  /** Dismiss all notifications */
  dismissAll: () => void;
  /** Current position */
  position: NotificationPosition;
}

const DEFAULT_DURATION = 5000;
const MAX_NOTIFICATIONS = 5;

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    defaultDuration = DEFAULT_DURATION,
    maxNotifications = MAX_NOTIFICATIONS,
    position = 'top-right',
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate unique ID
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add notification
  const notify = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? defaultDuration,
      dismissible: notification.dismissible ?? true,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      // Keep only maxNotifications
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [defaultDuration, maxNotifications]);

  // Shorthand methods
  const success = useCallback((title: string, message?: string): string => {
    return notify({ type: 'success', title, message });
  }, [notify]);

  const error = useCallback((title: string, message?: string): string => {
    return notify({ type: 'error', title, message, duration: 0 }); // Errors don't auto-dismiss
  }, [notify]);

  const warning = useCallback((title: string, message?: string): string => {
    return notify({ type: 'warning', title, message });
  }, [notify]);

  const info = useCallback((title: string, message?: string): string => {
    return notify({ type: 'info', title, message });
  }, [notify]);

  // Dismiss notification
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Dismiss all
  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-dismiss based on duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dismiss(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dismiss]);

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    position,
  };
}

// Type config for styling
export const notificationStyles: Record<NotificationType, {
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}> = {
  success: {
    icon: '✓',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  error: {
    icon: '✕',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
  warning: {
    icon: '⚠',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
  },
  info: {
    icon: 'ℹ',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
};

export default useNotifications;
