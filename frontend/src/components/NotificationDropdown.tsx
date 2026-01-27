'use client';

/**
 * NotificationDropdown Component
 * Dropdown menu for displaying user notifications
 * @module components/NotificationDropdown
 * @version 1.0.0
 */

import { useState, useEffect, useRef, memo, useCallback } from 'react';

type NotificationType = 
  | 'sale'
  | 'offer'
  | 'offer_accepted'
  | 'outbid'
  | 'listing_expired'
  | 'transfer'
  | 'follow'
  | 'mint'
  | 'price_drop';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationDropdownProps {
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const notificationConfig: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
  sale: { icon: '💰', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  offer: { icon: '🤝', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  offer_accepted: { icon: '✅', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  outbid: { icon: '⚡', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  listing_expired: { icon: '⏰', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  transfer: { icon: '↔️', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  follow: { icon: '👤', color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  mint: { icon: '✨', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  price_drop: { icon: '📉', color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'sale',
    title: 'NFT Sold!',
    message: 'Your "Stacks Punk #42" sold for 100 STX',
    read: false,
    createdAt: new Date(Date.now() - 60000 * 5),
  },
  {
    id: '2',
    type: 'offer',
    title: 'New Offer',
    message: 'You received an offer of 50 STX on "Bitcoin Art #7"',
    read: false,
    createdAt: new Date(Date.now() - 60000 * 30),
  },
  {
    id: '3',
    type: 'outbid',
    title: 'Outbid',
    message: 'Someone placed a higher offer on "Block Hero #99"',
    read: true,
    createdAt: new Date(Date.now() - 60000 * 60),
  },
  {
    id: '4',
    type: 'follow',
    title: 'New Follower',
    message: 'CryptoCollector started following you',
    read: true,
    createdAt: new Date(Date.now() - 60000 * 120),
  },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function NotificationItem({ 
  notification, 
  onRead 
}: { 
  notification: Notification; 
  onRead: () => void;
}) {
  const config = notificationConfig[notification.type];
  
  return (
    <div 
      className={`
        flex gap-3 p-3 cursor-pointer transition-all
        ${notification.read ? 'bg-transparent' : 'bg-purple-500/5'}
        hover:bg-gray-800/50
      `}
      onClick={onRead}
    >
      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${config.bgColor}
      `}>
        <span className="text-lg">{config.icon}</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-medium text-sm ${notification.read ? 'text-gray-300' : 'text-white'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate mt-0.5">
          {notification.message}
        </p>
      </div>
      
      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

function NotificationDropdownComponent({
  notifications = mockNotifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const actualUnreadCount = unreadCount ?? localNotifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = useCallback((id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    } else {
      setLocalNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  }, [onMarkAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [onMarkAllAsRead]);

  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    } else {
      setLocalNotifications([]);
    }
    setIsOpen(false);
  }, [onClearAll]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge */}
        {actualUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {actualUnreadCount > 9 ? '9+' : actualUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {actualUnreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {localNotifications.length > 0 ? (
              <div className="divide-y divide-gray-800/50">
                {localNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => handleMarkAsRead(notification.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <span className="text-3xl block mb-2">🔔</span>
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {localNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View all →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(NotificationDropdownComponent);
export type { Notification, NotificationType };
