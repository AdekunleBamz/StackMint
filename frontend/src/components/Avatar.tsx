'use client';

import { type ReactNode, type HTMLAttributes, forwardRef, useState } from 'react';

/**
 * Avatar Component
 * Display user profile images with fallback and status indicators
 * @module components/Avatar
 * @version 2.0.0
 */

// ============================================================================
// Constants
// ============================================================================

/** Maximum avatars to show in a group before "+N" indicator */
const DEFAULT_GROUP_MAX = 5;

/** Status indicator pulse animation duration */
const STATUS_PULSE_DURATION = 2000;

/** Overlap amount for avatar group in pixels */
const GROUP_OVERLAP = -8;

// ============================================================================
// Types
// ============================================================================

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarShape = 'circle' | 'square' | 'rounded';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

/**
 * Avatar loading state
 */
type AvatarLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  fallback?: ReactNode;
  verified?: boolean;
  className?: string;
}

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string; verified: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', status: 'w-2 h-2', verified: 'w-3 h-3' },
  sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2.5 h-2.5', verified: 'w-3.5 h-3.5' },
  md: { container: 'w-10 h-10', text: 'text-base', status: 'w-3 h-3', verified: 'w-4 h-4' },
  lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3.5 h-3.5', verified: 'w-5 h-5' },
  xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-4 h-4', verified: 'w-6 h-6' },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl', status: 'w-5 h-5', verified: 'w-7 h-7' },
};

const shapeStyles: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-lg',
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  none: '',
};

// Color palette for fallback backgrounds based on name
const fallbackColors = [
  'bg-orange-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-red-500',
  'bg-amber-500',
];

// ============================================================================
// Utility Functions
// ============================================================================

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  if (!name) return fallbackColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

// ============================================================================
// Avatar Component
// ============================================================================

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      name = '',
      size = 'md',
      shape = 'circle',
      status = 'none',
      fallback,
      verified = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const styles = sizeStyles[size];
    const showFallback = !src || imageError;

    return (
      <div
        ref={ref}
        className={`relative inline-flex shrink-0 ${className}`}
        {...props}
      >
        {/* Avatar Container */}
        <div
          className={`
            ${styles.container}
            ${shapeStyles[shape]}
            overflow-hidden
            flex items-center justify-center
            ${showFallback ? getColorFromName(name) : 'bg-gray-700'}
            ring-2 ring-gray-800
          `}
        >
          {!showFallback ? (
            <img
              src={src}
              alt={alt || name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : fallback ? (
            fallback
          ) : (
            <span className={`font-medium text-white ${styles.text}`}>
              {getInitials(name)}
            </span>
          )}
        </div>

        {/* Status Indicator */}
        {status !== 'none' && (
          <span
            className={`
              absolute bottom-0 right-0
              ${styles.status}
              ${statusColors[status]}
              ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}
              ring-2 ring-gray-900
            `}
            aria-label={`Status: ${status}`}
          />
        )}

        {/* Verified Badge */}
        {verified && (
          <div
            className={`
              absolute -bottom-0.5 -right-0.5
              ${styles.verified}
              bg-blue-500 rounded-full
              flex items-center justify-center
              ring-2 ring-gray-900
            `}
          >
            <svg
              className="w-3/5 h-3/5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// ============================================================================
// Avatar with Label
// ============================================================================

interface AvatarWithLabelProps extends AvatarProps {
  label: string;
  sublabel?: string;
  labelPosition?: 'right' | 'bottom';
}

export function AvatarWithLabel({
  label,
  sublabel,
  labelPosition = 'right',
  className = '',
  ...avatarProps
}: AvatarWithLabelProps) {
  const isHorizontal = labelPosition === 'right';

  return (
    <div
      className={`
        flex items-center
        ${isHorizontal ? 'flex-row gap-3' : 'flex-col gap-2 text-center'}
        ${className}
      `}
    >
      <Avatar {...avatarProps} />
      <div>
        <p className="font-medium text-white truncate">{label}</p>
        {sublabel && (
          <p className="text-sm text-gray-400 truncate">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Avatar Group
// ============================================================================

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;
  const styles = sizeStyles[size];

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="relative hover:z-10">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${styles.container}
            rounded-full
            bg-gray-700
            flex items-center justify-center
            ring-2 ring-gray-900
          `}
        >
          <span className={`text-gray-300 font-medium ${styles.text}`}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Wallet Avatar (Stacks Address)
// ============================================================================

interface WalletAvatarProps extends Omit<AvatarProps, 'src' | 'name'> {
  address: string;
  showAddress?: boolean;
}

export function WalletAvatar({
  address,
  showAddress = false,
  size = 'md',
  className = '',
  ...props
}: WalletAvatarProps) {
  // Generate a deterministic color pattern based on address
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  
  // Create a simple avatar pattern from the address
  const colors = ['#F97316', '#3B82F6', '#22C55E', '#A855F7', '#EC4899'];
  const getAddressColor = (addr: string) => {
    let hash = 0;
    for (let i = 0; i < addr.length; i++) {
      hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getAddressColor(address);

  if (showAddress) {
    return (
      <AvatarWithLabel
        name={shortAddress}
        label={shortAddress}
        size={size}
        className={className}
        {...props}
        fallback={
          <div
            className="w-full h-full flex items-center justify-center font-mono"
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-white text-xs font-bold">
              {address.slice(0, 2)}
            </span>
          </div>
        }
      />
    );
  }

  return (
    <Avatar
      name={shortAddress}
      size={size}
      className={className}
      {...props}
      fallback={
        <div
          className="w-full h-full flex items-center justify-center font-mono"
          style={{ backgroundColor: bgColor }}
        >
          <span className="text-white text-xs font-bold">
            {address.slice(0, 2)}
          </span>
        </div>
      }
    />
  );
}

// ============================================================================
// NFT Avatar (for collection/NFT thumbnails)
// ============================================================================

interface NFTAvatarProps extends Omit<AvatarProps, 'name'> {
  tokenId?: string | number;
  collectionName?: string;
  placeholder?: 'geometric' | 'gradient' | 'icon';
}

export function NFTAvatar({
  src,
  tokenId,
  collectionName,
  placeholder = 'geometric',
  size = 'md',
  shape = 'rounded',
  className = '',
  ...props
}: NFTAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const styles = sizeStyles[size];
  const name = collectionName || `NFT #${tokenId}`;

  // Generate placeholder based on type
  const renderPlaceholder = () => {
    switch (placeholder) {
      case 'geometric':
        return (
          <div className={`w-full h-full ${getColorFromName(name)} flex items-center justify-center`}>
            <svg className="w-1/2 h-1/2 text-white/50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
            </svg>
          </div>
        );
      case 'gradient':
        return (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-purple-600" />
        );
      case 'icon':
        return (
          <div className={`w-full h-full ${getColorFromName(name)} flex items-center justify-center`}>
            <svg className="w-1/2 h-1/2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} {...props}>
      <div
        className={`
          ${styles.container}
          ${shapeStyles[shape]}
          overflow-hidden
          ring-2 ring-gray-700
        `}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          renderPlaceholder()
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Creator Avatar (with optional role badge)
// ============================================================================

interface CreatorAvatarProps extends AvatarProps {
  role?: 'creator' | 'collector' | 'artist' | 'admin';
  showRole?: boolean;
}

export function CreatorAvatar({
  role = 'creator',
  showRole = true,
  size = 'md',
  className = '',
  ...props
}: CreatorAvatarProps) {
  const roleColors = {
    creator: 'bg-orange-500',
    collector: 'bg-blue-500',
    artist: 'bg-purple-500',
    admin: 'bg-red-500',
  };

  const roleIcons = {
    creator: '✨',
    collector: '💎',
    artist: '🎨',
    admin: '⚡',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <Avatar size={size} {...props} />
      {showRole && (
        <span
          className={`
            absolute -bottom-1 -right-1
            ${roleColors[role]}
            text-xs rounded-full
            w-5 h-5 flex items-center justify-center
            ring-2 ring-gray-900
          `}
          title={role.charAt(0).toUpperCase() + role.slice(1)}
        >
          {roleIcons[role]}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Editable Avatar
// ============================================================================

interface EditableAvatarProps extends AvatarProps {
  onEdit?: () => void;
  editLabel?: string;
}

export function EditableAvatar({
  onEdit,
  editLabel = 'Change avatar',
  size = 'xl',
  className = '',
  ...props
}: EditableAvatarProps) {
  return (
    <div className={`relative inline-flex group ${className}`}>
      <Avatar size={size} {...props} />
      {onEdit && (
        <button
          onClick={onEdit}
          className="
            absolute inset-0
            bg-black/50 opacity-0 group-hover:opacity-100
            rounded-full flex items-center justify-center
            transition-opacity cursor-pointer
          "
          aria-label={editLabel}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Avatar;
