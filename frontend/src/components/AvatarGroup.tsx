'use client';

/**
 * AvatarGroup Component
 * Display multiple avatars in a stacked group
 * @module components/AvatarGroup
 * @version 1.0.0
 */

import { memo } from 'react';
import Link from 'next/link';

interface AvatarUser {
  id: string;
  name?: string;
  image?: string;
  address?: string;
  href?: string;
}

interface AvatarGroupProps {
  users: AvatarUser[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showNames?: boolean;
  clickable?: boolean;
  className?: string;
}

function AvatarGroupComponent({
  users,
  max = 5,
  size = 'md',
  showNames = false,
  clickable = true,
  className = '',
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = Math.max(0, users.length - max);

  const sizeClasses = {
    xs: { avatar: 'w-6 h-6', text: 'text-[10px]', overlap: '-ml-2', ring: 'ring-1' },
    sm: { avatar: 'w-8 h-8', text: 'text-xs', overlap: '-ml-2.5', ring: 'ring-2' },
    md: { avatar: 'w-10 h-10', text: 'text-sm', overlap: '-ml-3', ring: 'ring-2' },
    lg: { avatar: 'w-12 h-12', text: 'text-base', overlap: '-ml-4', ring: 'ring-2' },
  };

  const styles = sizeClasses[size];

  // Generate gradient color from string
  const getGradient = (str: string) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-green-500',
      'from-yellow-500 to-orange-500',
    ];
    const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[index % gradients.length];
  };

  // Get initials from name or address
  const getInitials = (user: AvatarUser) => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.address) {
      return user.address.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const renderAvatar = (user: AvatarUser, index: number) => {
    const isFirst = index === 0;
    
    const avatarContent = (
      <div
        className={`
          relative ${styles.avatar} rounded-full ${styles.ring} ring-gray-900
          flex items-center justify-center overflow-hidden
          transition-transform hover:z-10 hover:scale-110
          ${!isFirst ? styles.overlap : ''}
          ${clickable ? 'cursor-pointer' : ''}
        `}
        title={user.name || user.address}
        style={{ zIndex: visibleUsers.length - index }}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`
            w-full h-full bg-gradient-to-br ${getGradient(user.id)}
            flex items-center justify-center
          `}>
            <span className={`${styles.text} font-bold text-white`}>
              {getInitials(user)}
            </span>
          </div>
        )}
      </div>
    );

    if (clickable && user.href) {
      return (
        <Link key={user.id} href={user.href}>
          {avatarContent}
        </Link>
      );
    }

    return <div key={user.id}>{avatarContent}</div>;
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Avatars */}
      <div className="flex">
        {visibleUsers.map((user, index) => renderAvatar(user, index))}
        
        {/* Remaining count */}
        {remainingCount > 0 && (
          <div
            className={`
              ${styles.avatar} ${styles.overlap} rounded-full
              ${styles.ring} ring-gray-900
              bg-gray-800 flex items-center justify-center
            `}
            style={{ zIndex: 0 }}
          >
            <span className={`${styles.text} font-medium text-gray-400`}>
              +{remainingCount}
            </span>
          </div>
        )}
      </div>

      {/* Names list */}
      {showNames && visibleUsers.length > 0 && (
        <div className="ml-3 text-sm">
          <span className="text-white font-medium">
            {visibleUsers[0].name || `${visibleUsers[0].address?.slice(0, 6)}...`}
          </span>
          {visibleUsers.length > 1 && (
            <span className="text-gray-400">
              {' '}and {users.length - 1} others
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Single Avatar Component
 */
interface AvatarProps {
  user: AvatarUser;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export function Avatar({
  user,
  size = 'md',
  showStatus = false,
  status = 'online',
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    xs: { avatar: 'w-6 h-6', text: 'text-[10px]', status: 'w-1.5 h-1.5' },
    sm: { avatar: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2' },
    md: { avatar: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5' },
    lg: { avatar: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3' },
    xl: { avatar: 'w-16 h-16', text: 'text-lg', status: 'w-3.5 h-3.5' },
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const styles = sizeClasses[size];

  const getGradient = (str: string) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
    ];
    const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[index % gradients.length];
  };

  const getInitials = () => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.address) {
      return user.address.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${styles.avatar} rounded-full overflow-hidden
          flex items-center justify-center
        `}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`
            w-full h-full bg-gradient-to-br ${getGradient(user.id)}
            flex items-center justify-center
          `}>
            <span className={`${styles.text} font-bold text-white`}>
              {getInitials()}
            </span>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {showStatus && (
        <span className={`
          absolute bottom-0 right-0
          ${styles.status} rounded-full
          ${statusColors[status]}
          ring-2 ring-gray-900
        `} />
      )}
    </div>
  );
}

export default memo(AvatarGroupComponent);
