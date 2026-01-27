'use client';

/**
 * ShareButton Component
 * Social sharing button with dropdown for multiple platforms
 * @module components/ShareButton
 * @version 1.0.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';

/** Share platforms configuration */
type SharePlatform = 'twitter' | 'facebook' | 'telegram' | 'discord' | 'copy';

interface ShareOption {
  id: SharePlatform;
  label: string;
  icon: string;
  color: string;
}

interface ShareButtonProps {
  /** URL to share */
  url?: string;
  /** Title/text to share */
  title: string;
  /** Optional description */
  description?: string;
  /** Image URL for platforms that support it */
  imageUrl?: string;
  /** Variant style */
  variant?: 'default' | 'icon' | 'text';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Callback when shared */
  onShare?: (platform: SharePlatform) => void;
}

const shareOptions: ShareOption[] = [
  { id: 'twitter', label: 'Twitter', icon: '𝕏', color: 'hover:bg-black' },
  { id: 'facebook', label: 'Facebook', icon: 'f', color: 'hover:bg-blue-600' },
  { id: 'telegram', label: 'Telegram', icon: '✈️', color: 'hover:bg-sky-500' },
  { id: 'discord', label: 'Discord', icon: '💬', color: 'hover:bg-indigo-600' },
  { id: 'copy', label: 'Copy Link', icon: '🔗', color: 'hover:bg-gray-600' },
];

const sizeClasses = {
  sm: {
    button: 'p-1.5 text-sm',
    icon: 'w-4 h-4',
    dropdown: 'text-xs',
  },
  md: {
    button: 'p-2 text-base',
    icon: 'w-5 h-5',
    dropdown: 'text-sm',
  },
  lg: {
    button: 'p-3 text-lg',
    icon: 'w-6 h-6',
    dropdown: 'text-base',
  },
};

export default function ShareButton({
  url,
  title,
  description = '',
  imageUrl,
  variant = 'default',
  size = 'md',
  className = '',
  onShare,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = useCallback(async (platform: SharePlatform) => {
    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'discord':
        // Discord doesn't have a direct share URL, so we copy to clipboard with Discord formatting
        await navigator.clipboard.writeText(`**${title}**\n${description}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400,noopener,noreferrer');
    }

    onShare?.(platform);
    
    if (platform !== 'copy' && platform !== 'discord') {
      setIsOpen(false);
    }
  }, [encodedUrl, encodedTitle, encodedDescription, shareUrl, title, description, onShare]);

  // Check for native share API
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleNativeShare = useCallback(async () => {
    if (hasNativeShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        onShare?.('copy');
      } catch (error) {
        // User cancelled or share failed, fallback to dropdown
        setIsOpen(true);
      }
    } else {
      setIsOpen(!isOpen);
    }
  }, [hasNativeShare, title, description, shareUrl, onShare, isOpen]);

  const sizes = sizeClasses[size];

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Share Button */}
      {variant === 'icon' ? (
        <button
          onClick={handleNativeShare}
          className={`${sizes.button} bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all`}
          aria-label="Share"
          aria-expanded={isOpen}
        >
          <svg className={sizes.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      ) : variant === 'text' ? (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-expanded={isOpen}
        >
          <svg className={sizes.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className={sizes.dropdown}>Share</span>
        </button>
      ) : (
        <button
          onClick={handleNativeShare}
          className={`flex items-center gap-2 ${sizes.button} px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all`}
          aria-expanded={isOpen}
        >
          <svg className={sizes.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
          <div className="p-2">
            <div className="text-xs text-gray-400 px-3 py-2 uppercase tracking-wider">
              Share via
            </div>
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white transition-colors ${option.color}`}
              >
                <span className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded-lg text-sm">
                  {option.icon}
                </span>
                <span className={sizes.dropdown}>
                  {option.id === 'copy' && copied ? 'Copied!' : option.label}
                </span>
                {option.id === 'copy' && copied && (
                  <span className="ml-auto text-green-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 150ms ease-out;
        }
      `}</style>
    </div>
  );
}

// Convenience export for icon-only variant
export function ShareIconButton(props: Omit<ShareButtonProps, 'variant'>) {
  return <ShareButton {...props} variant="icon" />;
}

// Convenience export for text variant
export function ShareTextButton(props: Omit<ShareButtonProps, 'variant'>) {
  return <ShareButton {...props} variant="text" />;
}
