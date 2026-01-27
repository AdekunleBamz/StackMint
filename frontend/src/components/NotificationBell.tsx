'use client';

/**
 * NotificationBell Component
 * Notification system with dropdown and real-time updates
 * @module components/NotificationBell
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';

// Icons
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Notification types
export type NotificationType = 
  | 'sale' 
  | 'offer' 
  | 'transfer' 
  | 'mint' 
  | 'auction_end' 
  | 'outbid'
  | 'price_drop'
  | 'collection_update'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    tokenId?: number;
    collectionAddress?: string;
    price?: number;
    imageUrl?: string;
  };
}

// Notification type configs
const notificationConfigs: Record<NotificationType, {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}> = {
  sale: {
    icon: <span className="text-lg">💰</span>,
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
  },
  offer: {
    icon: <span className="text-lg">🏷️</span>,
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
  },
  transfer: {
    icon: <span className="text-lg">📤</span>,
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
  },
  mint: {
    icon: <span className="text-lg">🎨</span>,
    bgColor: 'bg-pink-500/20',
    textColor: 'text-pink-400',
  },
  auction_end: {
    icon: <span className="text-lg">⏰</span>,
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
  },
  outbid: {
    icon: <span className="text-lg">⚠️</span>,
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
  },
  price_drop: {
    icon: <span className="text-lg">📉</span>,
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
  },
  collection_update: {
    icon: <span className="text-lg">📢</span>,
    bgColor: 'bg-indigo-500/20',
    textColor: 'text-indigo-400',
  },
  system: {
    icon: <span className="text-lg">ℹ️</span>,
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
  },
};

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// Single notification item
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = notificationConfigs[notification.type];

  return (
    <div
      className={`
        p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors
        ${!notification.read ? 'bg-gray-800/30' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${config.bgColor}
          `}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`
                font-semibold text-sm truncate
                ${!notification.read ? 'text-white' : 'text-gray-300'}
              `}
            >
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatRelativeTime(notification.timestamp)}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                <CheckIcon />
                Mark as read
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1"
            >
              <CloseIcon />
              Remove
            </button>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}

// Main NotificationBell component
interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { isConnected } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample notifications for demo
  useEffect(() => {
    if (isConnected) {
      setNotifications([
        {
          id: '1',
          type: 'sale',
          title: 'NFT Sold!',
          message: 'Your StacksMint #42 was sold for 250 STX',
          timestamp: new Date(Date.now() - 300000),
          read: false,
          metadata: { tokenId: 42, price: 250 },
        },
        {
          id: '2',
          type: 'offer',
          title: 'New Offer Received',
          message: 'You received an offer of 180 STX for StacksMint #23',
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          metadata: { tokenId: 23, price: 180 },
        },
        {
          id: '3',
          type: 'outbid',
          title: 'You\'ve Been Outbid',
          message: 'Someone placed a higher bid on StacksMint #99',
          timestamp: new Date(Date.now() - 7200000),
          read: true,
          metadata: { tokenId: 99 },
        },
        {
          id: '4',
          type: 'mint',
          title: 'Mint Successful',
          message: 'You successfully minted StacksMint #156',
          timestamp: new Date(Date.now() - 86400000),
          read: true,
          metadata: { tokenId: 156 },
        },
      ]);
    }
  }, [isConnected]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  if (!isConnected) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-lg transition-colors
          ${isOpen
            ? 'bg-gray-800 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }
        `}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="w-6 h-6" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-red-400"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-4 py-2 border-b border-gray-700 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`
                px-3 py-1 text-sm rounded-lg transition-colors
                ${filter === 'all'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`
                px-3 py-1 text-sm rounded-lg transition-colors
                ${filter === 'unread'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <BellIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">
                  {filter === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications yet'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClick={
                    notification.actionUrl
                      ? () => window.location.href = notification.actionUrl!
                      : undefined
                  }
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-700 text-center">
              <button className="text-sm text-primary-400 hover:text-primary-300">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Standalone notification toast
interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export function NotificationToast({
  notification,
  onClose,
  duration = 5000,
}: NotificationToastProps) {
  const config = notificationConfigs[notification.type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 animate-slide-in-right z-50">
      <div className="flex items-start gap-3">
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${config.bgColor}
          `}
        >
          {config.icon}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-white">{notification.title}</h4>
          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export default NotificationBell;
