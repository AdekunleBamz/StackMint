'use client';

/**
 * RarityBadge Component
 * NFT rarity tier display with visual indicators
 * @module components/RarityBadge
 * @version 1.0.0
 */

interface RarityBadgeProps {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showScore?: boolean;
  score?: number;
  className?: string;
  variant?: 'badge' | 'pill' | 'minimal';
}

const rarityConfig = {
  common: {
    label: 'Common',
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/50',
    textColor: 'text-gray-400',
    icon: '◆',
    glow: '',
    percentage: '50%+',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'from-green-400 to-green-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
    icon: '◆◆',
    glow: '',
    percentage: '25-50%',
  },
  rare: {
    label: 'Rare',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-400',
    icon: '◆◆◆',
    glow: 'shadow-blue-500/25',
    percentage: '10-25%',
  },
  epic: {
    label: 'Epic',
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
    icon: '★',
    glow: 'shadow-purple-500/30',
    percentage: '5-10%',
  },
  legendary: {
    label: 'Legendary',
    color: 'from-orange-400 to-yellow-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    textColor: 'text-orange-400',
    icon: '★★',
    glow: 'shadow-orange-500/40',
    percentage: '1-5%',
  },
  mythic: {
    label: 'Mythic',
    color: 'from-pink-400 via-purple-400 to-cyan-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    textColor: 'text-pink-400',
    icon: '✦',
    glow: 'shadow-pink-500/50',
    percentage: '<1%',
  },
};

export function RarityBadge({
  rarity,
  size = 'md',
  showLabel = true,
  showScore = false,
  score,
  className = '',
  variant = 'badge',
}: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      pill: 'px-2 py-0.5 text-xs',
      minimal: 'text-xs',
      icon: 'text-xs',
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      pill: 'px-3 py-1 text-sm',
      minimal: 'text-sm',
      icon: 'text-sm',
    },
    lg: {
      badge: 'px-4 py-1.5 text-base',
      pill: 'px-4 py-1.5 text-base',
      minimal: 'text-base',
      icon: 'text-base',
    },
  };

  if (variant === 'minimal') {
    return (
      <span className={`${config.textColor} ${sizeClasses[size].minimal} font-medium ${className}`}>
        <span className="mr-1">{config.icon}</span>
        {showLabel && config.label}
        {showScore && score !== undefined && (
          <span className="ml-1 opacity-70">#{score}</span>
        )}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full
          ${config.bgColor} ${config.borderColor} border
          ${sizeClasses[size].pill}
          ${rarity === 'legendary' || rarity === 'mythic' ? `shadow-lg ${config.glow}` : ''}
          ${className}
        `}
      >
        <span className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent font-bold ${sizeClasses[size].icon}`}>
          {config.icon}
        </span>
        {showLabel && (
          <span className={config.textColor}>
            {config.label}
          </span>
        )}
        {showScore && score !== undefined && (
          <span className={`${config.textColor} opacity-70`}>#{score}</span>
        )}
      </span>
    );
  }

  // Default badge variant
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-lg
        bg-gradient-to-r ${config.color}
        ${sizeClasses[size].badge}
        text-white font-medium
        ${rarity === 'legendary' || rarity === 'mythic' ? `shadow-lg ${config.glow} animate-pulse` : ''}
        ${className}
      `}
    >
      <span>{config.icon}</span>
      {showLabel && config.label}
      {showScore && score !== undefined && (
        <span className="opacity-80">#{score}</span>
      )}
    </span>
  );
}

/**
 * Rarity meter showing visual representation
 */
interface RarityMeterProps {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  showPercentage?: boolean;
  className?: string;
}

export function RarityMeter({ rarity, showPercentage = true, className = '' }: RarityMeterProps) {
  const config = rarityConfig[rarity];
  
  const rarityLevels = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const currentLevel = rarityLevels.indexOf(rarity);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
        {showPercentage && (
          <span className="text-xs text-gray-500">{config.percentage}</span>
        )}
      </div>
      
      <div className="flex gap-1">
        {rarityLevels.map((level, i) => {
          const levelConfig = rarityConfig[level as keyof typeof rarityConfig];
          return (
            <div
              key={level}
              className={`
                h-2 flex-1 rounded-full transition-all duration-300
                ${i <= currentLevel 
                  ? `bg-gradient-to-r ${levelConfig.color}` 
                  : 'bg-gray-700'
                }
              `}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Rarity breakdown card
 */
interface RarityBreakdownProps {
  traits: {
    name: string;
    value: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    percentage: number;
  }[];
  className?: string;
}

export function RarityBreakdown({ traits, className = '' }: RarityBreakdownProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
        Traits & Rarity
      </h4>
      
      <div className="space-y-2">
        {traits.map((trait, i) => {
          const config = rarityConfig[trait.rarity];
          return (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{trait.name}</p>
                <p className="font-medium text-white">{trait.value}</p>
              </div>
              
              <div className="text-right space-y-1">
                <RarityBadge 
                  rarity={trait.rarity} 
                  size="sm" 
                  showLabel={false}
                  variant="minimal"
                />
                <p className="text-xs text-gray-500">
                  {trait.percentage.toFixed(1)}% have this
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RarityBadge;
