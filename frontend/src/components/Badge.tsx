'use client';

import { type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  icon?: ReactNode;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-700/50 text-gray-300 border-gray-600/50',
  success: 'bg-green-500/10 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
  orange: 'bg-orange-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

// ============================================================================
// Badge Component
// ============================================================================

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  dot = false,
  removable = false,
  onRemove,
  className = '',
  icon,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${rounded ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      
      {children}
      
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 p-0.5 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

// ============================================================================
// Status Badge
// ============================================================================

type StatusType = 'online' | 'offline' | 'busy' | 'away' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  showLabel?: boolean;
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant; dotClass: string }> = {
  online: { label: 'Online', variant: 'success', dotClass: 'bg-green-400 animate-pulse' },
  offline: { label: 'Offline', variant: 'default', dotClass: 'bg-gray-400' },
  busy: { label: 'Busy', variant: 'error', dotClass: 'bg-red-400' },
  away: { label: 'Away', variant: 'warning', dotClass: 'bg-yellow-400' },
  pending: { label: 'Pending', variant: 'info', dotClass: 'bg-blue-400 animate-pulse' },
};

export function StatusBadge({ status, showLabel = true, size = 'sm', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!showLabel) {
    return (
      <span 
        className={`inline-block w-2.5 h-2.5 rounded-full ${config.dotClass} ${className}`}
        title={config.label}
      />
    );
  }

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

// ============================================================================
// Rarity Badge (for NFTs)
// ============================================================================

type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface RarityBadgeProps {
  rarity: RarityType;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

const rarityConfig: Record<RarityType, { label: string; styles: string; icon: string }> = {
  common: {
    label: 'Common',
    styles: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    icon: '●',
  },
  uncommon: {
    label: 'Uncommon',
    styles: 'bg-green-500/10 text-green-400 border-green-500/30',
    icon: '◆',
  },
  rare: {
    label: 'Rare',
    styles: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: '★',
  },
  epic: {
    label: 'Epic',
    styles: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: '✦',
  },
  legendary: {
    label: 'Legendary',
    styles: 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 text-orange-400 border-orange-500/30',
    icon: '✧',
  },
  mythic: {
    label: 'Mythic',
    styles: 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 border-pink-500/30',
    icon: '❖',
  },
};

export function RarityBadge({ rarity, size = 'sm', showIcon = true, className = '' }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium border rounded-md
        ${config.styles}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}

// ============================================================================
// Network Badge
// ============================================================================

type NetworkType = 'mainnet' | 'testnet' | 'devnet';

interface NetworkBadgeProps {
  network: NetworkType;
  size?: BadgeSize;
  className?: string;
}

const networkConfig: Record<NetworkType, { label: string; variant: BadgeVariant }> = {
  mainnet: { label: 'Mainnet', variant: 'success' },
  testnet: { label: 'Testnet', variant: 'warning' },
  devnet: { label: 'Devnet', variant: 'purple' },
};

export function NetworkBadge({ network, size = 'sm', className = '' }: NetworkBadgeProps) {
  const config = networkConfig[network];

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

// ============================================================================
// Transaction Status Badge
// ============================================================================

type TxStatusType = 'pending' | 'success' | 'failed' | 'dropped';

interface TxStatusBadgeProps {
  status: TxStatusType;
  size?: BadgeSize;
  className?: string;
}

const txStatusConfig: Record<TxStatusType, { label: string; variant: BadgeVariant; icon: ReactNode }> = {
  pending: {
    label: 'Pending',
    variant: 'warning',
    icon: (
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
  },
  success: {
    label: 'Success',
    variant: 'success',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  failed: {
    label: 'Failed',
    variant: 'error',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  dropped: {
    label: 'Dropped',
    variant: 'default',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
};

export function TxStatusBadge({ status, size = 'sm', className = '' }: TxStatusBadgeProps) {
  const config = txStatusConfig[status];

  return (
    <Badge variant={config.variant} size={size} icon={config.icon} className={className}>
      {config.label}
    </Badge>
  );
}

// ============================================================================
// Count Badge (for notifications)
// ============================================================================

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export function CountBadge({ count, max = 99, variant = 'error', size = 'sm', className = '' }: CountBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeClasses = {
    sm: 'min-w-[18px] h-[18px] text-[10px]',
    md: 'min-w-[22px] h-[22px] text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-bold rounded-full
        ${variantStyles[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}

// ============================================================================
// Verified Badge
// ============================================================================

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function VerifiedBadge({ size = 'md', className = '', showLabel = false }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badge = (
    <svg
      className={`${sizeClasses[size]} text-blue-500 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Verified"
    >
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  if (showLabel) {
    return (
      <span className="inline-flex items-center gap-1 text-blue-400 text-sm">
        {badge}
        <span>Verified</span>
      </span>
    );
  }

  return badge;
}

// ============================================================================
// Badge Group
// ============================================================================

interface BadgeGroupProps {
  children: ReactNode;
  max?: number;
  className?: string;
}

export function BadgeGroup({ children, max, className = '' }: BadgeGroupProps) {
  const badges = Array.isArray(children) ? children : [children];
  const visibleBadges = max ? badges.slice(0, max) : badges;
  const remainingCount = max ? badges.length - max : 0;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visibleBadges}
      {remainingCount > 0 && (
        <Badge variant="default" size="sm">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

export default Badge;
