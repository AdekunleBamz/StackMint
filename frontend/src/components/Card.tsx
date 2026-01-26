'use client';

import { type ReactNode, type HTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardBaseProps {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  clickable?: boolean;
  className?: string;
}

interface CardProps extends CardBaseProps, HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardLinkProps extends CardBaseProps {
  children: ReactNode;
  href: string;
  external?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-gray-800/50 border border-gray-700/50',
  elevated: 'bg-gray-800 shadow-xl shadow-black/20 border border-gray-700/30',
  outlined: 'bg-transparent border-2 border-gray-700',
  filled: 'bg-gray-800 border border-transparent',
  gradient: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const hoverStyles = 'transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1';
const clickableStyles = 'cursor-pointer';

// ============================================================================
// Card Component
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      clickable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl overflow-hidden
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hover ? hoverStyles : ''}
          ${clickable ? clickableStyles : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Card Link (Clickable Card)
// ============================================================================

export function CardLink({
  children,
  href,
  external = false,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardLinkProps) {
  const cardClasses = `
    block rounded-2xl overflow-hidden
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${hoverStyles}
    ${clickableStyles}
    ${className}
  `;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cardClasses}>
      {children}
    </Link>
  );
}

// ============================================================================
// Card Header
// ============================================================================

interface CardHeaderProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  children,
  title,
  description,
  action,
  className = '',
}: CardHeaderProps) {
  // If children are provided, render them directly
  if (children && !title) {
    return (
      <div className={`mb-4 ${className}`}>
        {children}
      </div>
    );
  }

  // Otherwise render structured header
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-gray-400 mt-1">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Card Body
// ============================================================================

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

// ============================================================================
// Card Footer
// ============================================================================

interface CardFooterProps {
  children: ReactNode;
  separator?: boolean;
  className?: string;
}

export function CardFooter({ children, separator = true, className = '' }: CardFooterProps) {
  return (
    <div
      className={`
        mt-4 pt-4 
        ${separator ? 'border-t border-gray-700/50' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Card Image
// ============================================================================

interface CardImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  overlay?: ReactNode;
  className?: string;
}

export function CardImage({
  src,
  alt,
  aspectRatio = 'square',
  overlay,
  className = '',
}: CardImageProps) {
  const aspectStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]',
  };

  return (
    <div className={`relative ${aspectStyles[aspectRatio]} overflow-hidden -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          {overlay}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Stats Card
// ============================================================================

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ label, value, change, icon, className = '' }: StatsCardProps) {
  const changeColors = {
    increase: 'text-green-400',
    decrease: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const changeIcons = {
    increase: '↑',
    decrease: '↓',
    neutral: '→',
  };

  return (
    <Card variant="default" padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[change.type]}`}>
              {changeIcons[change.type]} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gray-700/50 rounded-xl text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Feature Card
// ============================================================================

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <Card variant="default" padding="lg" hover className={className}>
      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </Card>
  );
}

// ============================================================================
// Profile Card
// ============================================================================

interface ProfileCardProps {
  avatar: string;
  name: string;
  address?: string;
  verified?: boolean;
  stats?: { label: string; value: string | number }[];
  className?: string;
}

export function ProfileCard({
  avatar,
  name,
  address,
  verified = false,
  stats,
  className = '',
}: ProfileCardProps) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <Card variant="elevated" padding="lg" className={className}>
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <img
            src={avatar}
            alt={name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-700"
          />
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white">{name}</h3>
        {address && (
          <p className="text-sm text-gray-400 font-mono mt-1">{shortAddress}</p>
        )}

        {stats && stats.length > 0 && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700/50">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Pricing Card
// ============================================================================

interface PricingCardProps {
  title: string;
  price: string;
  currency?: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  buttonLabel?: string;
  onSelect?: () => void;
  className?: string;
}

export function PricingCard({
  title,
  price,
  currency = 'STX',
  period,
  features,
  highlighted = false,
  buttonLabel = 'Get Started',
  onSelect,
  className = '',
}: PricingCardProps) {
  return (
    <Card
      variant={highlighted ? 'gradient' : 'default'}
      padding="lg"
      className={`relative ${highlighted ? 'ring-2 ring-orange-500' : ''} ${className}`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 rounded-full text-xs font-medium text-white">
          Popular
        </div>
      )}

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-gray-400">{currency}</span>
        {period && <span className="text-gray-500">/{period}</span>}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-300">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          highlighted
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        {buttonLabel}
      </button>
    </Card>
  );
}

// ============================================================================
// Card Grid
// ============================================================================

interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CardGrid({ children, columns = 3, gap = 'md', className = '' }: CardGridProps) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapStyles = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${columnStyles[columns]} ${gapStyles[gap]} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
