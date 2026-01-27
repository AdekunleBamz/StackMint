'use client';

/**
 * NotificationCenter Component
 * Full notification management system
 * @module components/NotificationCenter
 * @version 1.0.0
 */

import { memo, useState, useCallback, createContext, useContext, ReactNode } from 'react';

// Types
export interface Notification {
  id: string;
  type: 'sale' | 'offer' | 'mint' | 'transfer' | 'like' | 'follow' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  image?: string;
  link?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Context
const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Provider
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Notification type icons and colors
const notificationConfig = {
  sale: {
    icon: '💰',
    color: 'text-green-400',
    bgColor: 'bg-green-600/20',
  },
  offer: {
    icon: '🏷️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
  },
  mint: {
    icon: '✨',
    color: 'text-purple-400',
    bgColor: 'bg-purple-600/20',
  },
  transfer: {
    icon: '↗️',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600/20',
  },
  like: {
    icon: '❤️',
    color: 'text-red-400',
    bgColor: 'bg-red-600/20',
  },
  follow: {
    icon: '👤',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-600/20',
  },
  system: {
    icon: '🔔',
    color: 'text-gray-400',
    bgColor: 'bg-gray-600/20',
  },
};

// Individual notification item
interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
  compact?: boolean;
}

function NotificationItem({
  notification,
  onRead,
  onRemove,
  compact = false,
}: NotificationItemProps) {
  const config = notificationConfig[notification.type];
  
  const formatTime = (date: Date) => {
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
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-3 p-3 cursor-pointer
          ${notification.read ? 'bg-transparent' : 'bg-purple-600/5'}
          hover:bg-gray-800/50 transition-colors
        `}
      >
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${notification.read ? 'text-gray-400' : 'text-white'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        relative p-4 rounded-xl border
        ${notification.read 
          ? 'bg-gray-900/50 border-gray-800' 
          : 'bg-purple-600/5 border-purple-600/20'
        }
      `}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full" />
      )}

      <div className="flex gap-4">
        {/* Image or Icon */}
        {notification.image ? (
          <img
            src={notification.image}
            alt=""
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center text-2xl`}>
            {config.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(notification.timestamp)}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            {notification.actionLabel && notification.onAction && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  notification.onAction?.();
                }}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                {notification.actionLabel}
              </button>
            )}
            
            {!notification.read && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRead();
                }}
                className="text-sm text-gray-500 hover:text-gray-300"
              >
                Mark as read
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-sm text-gray-500 hover:text-red-400 ml-auto"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main NotificationCenter component
interface NotificationCenterProps {
  className?: string;
}

function NotificationCenterComponent({ className = '' }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className={`bg-gray-900 rounded-2xl border border-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-800">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`
            flex-1 py-3 text-sm font-medium transition-colors
            ${filter === 'all' 
              ? 'text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`
            flex-1 py-3 text-sm font-medium transition-colors
            ${filter === 'unread' 
              ? 'text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-gray-300'
            }
          `}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-400">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onRemove={() => removeNotification(notification.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * NotificationBadge - shows count on an icon
 */
interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  className = '',
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span className={`
      absolute -top-1 -right-1 min-w-[18px] h-[18px]
      flex items-center justify-center
      bg-red-500 text-white text-xs font-bold
      rounded-full px-1
      ${className}
    `}>
      {displayCount}
    </span>
  );
}

/**
 * ActivityFeed - timeline of activities
 */
interface Activity {
  id: string;
  type: 'sale' | 'offer' | 'mint' | 'transfer' | 'like' | 'follow';
  actor: string;
  actorImage?: string;
  action: string;
  target?: string;
  targetImage?: string;
  value?: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
  className?: string;
}

export function ActivityFeed({
  activities,
  limit = 10,
  className = '',
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {displayActivities.map((activity, index) => {
        const config = notificationConfig[activity.type];
        
        return (
          <div
            key={activity.id}
            className="relative pl-8 pb-6 last:pb-0"
          >
            {/* Timeline line */}
            {index < displayActivities.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-800" />
            )}

            {/* Timeline dot */}
            <div className={`
              absolute left-0 w-6 h-6 rounded-full 
              ${config.bgColor} flex items-center justify-center text-sm
            `}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex items-start gap-3">
              {activity.actorImage && (
                <img
                  src={activity.actorImage}
                  alt={activity.actor}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">{activity.actor}</span>
                  {' '}{activity.action}{' '}
                  {activity.target && (
                    <span className="font-medium text-white">{activity.target}</span>
                  )}
                  {activity.value && (
                    <span className="text-green-400 font-medium"> for {activity.value}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
              {activity.targetImage && (
                <img
                  src={activity.targetImage}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(NotificationCenterComponent);
