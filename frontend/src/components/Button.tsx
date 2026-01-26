'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: 'default' | 'full' | 'none';
}

interface ButtonProps extends ButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  href?: never;
  external?: never;
}

interface LinkButtonProps extends ButtonBaseProps {
  href: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonOrLinkProps = ButtonProps | LinkButtonProps;

// ============================================================================
// Styles Configuration
// ============================================================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-orange-500 to-orange-600 
    hover:from-orange-600 hover:to-orange-700 
    text-white shadow-lg shadow-orange-500/25 
    hover:shadow-orange-500/40 
    border border-orange-500/50
    active:from-orange-700 active:to-orange-800
  `,
  secondary: `
    bg-gray-800 hover:bg-gray-700 
    text-white border border-gray-700 
    hover:border-gray-600
    active:bg-gray-900
  `,
  outline: `
    bg-transparent hover:bg-white/5 
    text-white border border-gray-600 
    hover:border-gray-500
    active:bg-white/10
  `,
  ghost: `
    bg-transparent hover:bg-white/10 
    text-gray-300 hover:text-white
    active:bg-white/20
  `,
  danger: `
    bg-red-500 hover:bg-red-600 
    text-white shadow-lg shadow-red-500/25 
    border border-red-500/50
    active:bg-red-700
  `,
  success: `
    bg-green-500 hover:bg-green-600 
    text-white shadow-lg shadow-green-500/25 
    border border-green-500/50
    active:bg-green-700
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-lg gap-3',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const roundedStyles = {
  default: 'rounded-lg',
  full: 'rounded-full',
  none: 'rounded-none',
};

// ============================================================================
// Loading Spinner
// ============================================================================

function LoadingSpinner({ size }: { size: ButtonSize }) {
  const sizeClass = iconSizeStyles[size];
  
  return (
    <svg
      className={`animate-spin ${sizeClass}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================================================
// Button Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = 'default',
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const disabled = isDisabled || isLoading;

    const classes = `
      inline-flex items-center justify-center
      font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${roundedStyles[rounded]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className={iconSizeStyles[size]}>{leftIcon}</span>
        ) : null}
        
        {children && <span>{children}</span>}
        
        {!isLoading && rightIcon && (
          <span className={iconSizeStyles[size]}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// Link Button Component
// ============================================================================

export function LinkButton({
  children,
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'default',
  className = '',
}: LinkButtonProps) {
  const classes = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900
    ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${roundedStyles[rounded]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {isLoading ? (
        <LoadingSpinner size={size} />
      ) : leftIcon ? (
        <span className={iconSizeStyles[size]}>{leftIcon}</span>
      ) : null}
      
      {children && <span>{children}</span>}
      
      {!isLoading && rightIcon && (
        <span className={iconSizeStyles[size]}>{rightIcon}</span>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-disabled={isDisabled}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-disabled={isDisabled}>
      {content}
    </Link>
  );
}

// ============================================================================
// Icon Button Component
// ============================================================================

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      rounded = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    // Square padding for icon buttons
    const iconPaddingStyles: Record<ButtonSize, string> = {
      xs: 'p-1.5',
      sm: 'p-2',
      md: 'p-2.5',
      lg: 'p-3',
      xl: 'p-4',
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        rounded={rounded}
        className={`${iconPaddingStyles[size]} ${className}`}
        {...props}
      >
        <span className={iconSizeStyles[size]}>{icon}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ============================================================================
// Button Group Component
// ============================================================================

interface ButtonGroupProps {
  children: ReactNode;
  attached?: boolean;
  className?: string;
}

export function ButtonGroup({ children, attached = false, className = '' }: ButtonGroupProps) {
  if (attached) {
    return (
      <div className={`inline-flex ${className}`} role="group">
        <style jsx>{`
          div > :global(button:not(:first-child):not(:last-child)),
          div > :global(a:not(:first-child):not(:last-child)) {
            border-radius: 0;
          }
          div > :global(button:first-child),
          div > :global(a:first-child) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          div > :global(button:last-child),
          div > :global(a:last-child) {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }
          div > :global(button:not(:last-child)),
          div > :global(a:not(:last-child)) {
            border-right-width: 0;
          }
        `}</style>
        {children}
      </div>
    );
  }

  return (
    <div className={`inline-flex gap-2 ${className}`} role="group">
      {children}
    </div>
  );
}

// ============================================================================
// Connect Wallet Button
// ============================================================================

interface ConnectWalletButtonProps extends Omit<ButtonProps, 'children'> {
  isConnected?: boolean;
  address?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function ConnectWalletButton({
  isConnected = false,
  address,
  onConnect,
  onDisconnect,
  isLoading,
  size = 'md',
  className = '',
  ...props
}: ConnectWalletButtonProps) {
  if (isConnected && address) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    return (
      <Button
        variant="secondary"
        size={size}
        onClick={onDisconnect}
        leftIcon={
          <div className="w-2 h-2 rounded-full bg-green-500" />
        }
        className={className}
        {...props}
      >
        {shortAddress}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size={size}
      onClick={onConnect}
      isLoading={isLoading}
      leftIcon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      className={className}
      {...props}
    >
      Connect Wallet
    </Button>
  );
}

// ============================================================================
// Mint Button
// ============================================================================

interface MintButtonProps extends Omit<ButtonProps, 'children'> {
  price?: string;
  currency?: string;
}

export function MintButton({
  price = '0.01',
  currency = 'STX',
  isLoading,
  isDisabled,
  size = 'lg',
  className = '',
  ...props
}: MintButtonProps) {
  return (
    <Button
      variant="primary"
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      fullWidth
      leftIcon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      }
      className={className}
      {...props}
    >
      {isLoading ? 'Minting...' : `Mint for ${price} ${currency}`}
    </Button>
  );
}

export default Button;
