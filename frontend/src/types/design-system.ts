/**
 * StacksMint Design System Types
 * Shared type definitions for UI components
 * @module types/design-system
 * @version 1.0.0
 */

// ============================================================================
// Size Variants
// ============================================================================

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonSize = Size;
export type InputSize = 'sm' | 'md' | 'lg';
export type AvatarSize = Size | '2xl' | '3xl';
export type BadgeSize = 'xs' | 'sm' | 'md';
export type IconSize = Size;

// ============================================================================
// Color Variants
// ============================================================================

export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
export type BadgeVariant = ColorVariant | 'neutral';
export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

// ============================================================================
// Component States
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface DisabledState {
  isDisabled: boolean;
  disabledReason?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// ============================================================================
// NFT Types
// ============================================================================

export type RarityLevel = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface NFTMetadata {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
  attributes?: NFTAttribute[];
  externalUrl?: string;
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'string' | 'number' | 'date' | 'boost_percentage' | 'boost_number';
}

export interface NFTListing {
  id: number;
  tokenId: number;
  name: string;
  description?: string;
  image: string | null;
  price: number;
  currency: 'STX';
  seller: string;
  collection: string;
  rarity: RarityLevel;
  listedAt: Date;
  expiresAt?: Date;
}

export interface NFTCollection {
  id: number;
  name: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  itemCount: number;
  ownerCount: number;
  floorPrice: number;
  totalVolume: number;
  verified: boolean;
  creator: string;
  createdAt: Date;
}

// ============================================================================
// Wallet Types
// ============================================================================

export type WalletProvider = 'hiro' | 'leather' | 'xverse' | 'walletconnect';

export interface WalletInfo {
  address: string;
  provider: WalletProvider;
  balance: number;
  isConnected: boolean;
}

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  message?: string;
  timestamp: Date;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
}

// ============================================================================
// Animation Types
// ============================================================================

export type AnimationVariant = 
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'slide-up'
  | 'slide-down'
  | 'slide-in-right'
  | 'slide-in-left'
  | 'scale-in'
  | 'bounce-gentle';

export interface AnimationConfig {
  variant: AnimationVariant;
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
}

// ============================================================================
// Layout Types
// ============================================================================

export type LayoutPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type LayoutGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// ============================================================================
// Utility Types
// ============================================================================

export type WithClassName<T = object> = T & { className?: string };
export type WithChildren<T = object> = T & { children?: React.ReactNode };
export type WithRef<T, E extends HTMLElement = HTMLDivElement> = T & { ref?: React.Ref<E> };

export type PropsWithAs<P, T extends React.ElementType> = P & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof P>;
