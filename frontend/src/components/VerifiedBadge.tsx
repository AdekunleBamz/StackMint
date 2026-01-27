'use client';

/**
 * VerifiedBadge Component
 * Display verification status with tooltip
 * @module components/VerifiedBadge
 * @version 1.0.0
 */

import { useState, memo } from 'react';

type VerificationType = 'verified' | 'official' | 'partner' | 'creator';

interface VerifiedBadgeProps {
  type?: VerificationType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  animate?: boolean;
}

const badgeConfig: Record<VerificationType, { 
  icon: string; 
  label: string; 
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  verified: {
    icon: '✓',
    label: 'Verified',
    description: 'This account or collection has been verified by StacksMint',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-400',
  },
  official: {
    icon: '★',
    label: 'Official',
    description: 'Official StacksMint partner or affiliated project',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-400',
  },
  partner: {
    icon: '◆',
    label: 'Partner',
    description: 'Trusted partner of the StacksMint ecosystem',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-400',
  },
  creator: {
    icon: '♦',
    label: 'Top Creator',
    description: 'Recognized top creator with proven track record',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500',
    borderColor: 'border-pink-400',
  },
};

const sizeConfig = {
  sm: {
    container: 'w-4 h-4',
    icon: 'text-[8px]',
    tooltip: 'text-xs',
  },
  md: {
    container: 'w-5 h-5',
    icon: 'text-[10px]',
    tooltip: 'text-sm',
  },
  lg: {
    container: 'w-6 h-6',
    icon: 'text-xs',
    tooltip: 'text-sm',
  },
};

function VerifiedBadgeComponent({
  type = 'verified',
  size = 'md',
  showTooltip = true,
  animate = true,
}: VerifiedBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = badgeConfig[type];
  const sizes = sizeConfig[size];

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      <div 
        className={`
          ${sizes.container} 
          ${config.bgColor} 
          rounded-full 
          flex items-center justify-center 
          ${animate ? 'verified-shine' : ''}
          shadow-lg
          transition-transform duration-200
          ${isHovered ? 'scale-110' : ''}
        `}
        role="img"
        aria-label={config.label}
      >
        <span className={`${sizes.icon} text-white font-bold`}>
          {config.icon}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className={`
            absolute left-1/2 -translate-x-1/2 bottom-full mb-2
            bg-gray-900 border border-gray-700 rounded-lg
            px-3 py-2 shadow-xl
            transition-all duration-200
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
            z-50 whitespace-nowrap
          `}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`${config.color} font-semibold ${sizes.tooltip}`}>
              {config.label}
            </span>
          </div>
          <p className="text-gray-400 text-xs max-w-48">
            {config.description}
          </p>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full">
            <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </div>
  );
}

// Extended badge with label
export function VerifiedBadgeWithLabel({
  type = 'verified',
  size = 'md',
}: {
  type?: VerificationType;
  size?: 'sm' | 'md' | 'lg';
}) {
  const config = badgeConfig[type];
  
  return (
    <div className={`inline-flex items-center gap-1.5 ${config.bgColor}/20 ${config.borderColor}/30 border rounded-full px-2.5 py-1`}>
      <VerifiedBadgeComponent type={type} size="sm" showTooltip={false} animate={false} />
      <span className={`${config.color} text-xs font-medium`}>{config.label}</span>
    </div>
  );
}

// Inline verified with name
export function VerifiedName({
  name,
  type = 'verified',
  size = 'md',
  className = '',
}: {
  name: string;
  type?: VerificationType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="font-medium text-white">{name}</span>
      <VerifiedBadgeComponent type={type} size={size} />
    </span>
  );
}

export default memo(VerifiedBadgeComponent);
export type { VerificationType };
