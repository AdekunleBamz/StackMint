'use client';

/**
 * CopyButton Component
 * Copy to clipboard with visual feedback
 * @module components/CopyButton
 * @version 1.0.0
 */

import { memo, useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  variant?: 'icon' | 'button' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  successMessage?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function CopyButtonComponent({
  text,
  variant = 'icon',
  size = 'md',
  label = 'Copy',
  successMessage = 'Copied!',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`
          inline-flex items-center gap-1 text-purple-400 hover:text-purple-300
          transition-colors text-sm
          ${className}
        `}
      >
        {copied ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gray-800/50 border border-gray-700
          text-gray-300 hover:text-white hover:border-gray-600
          transition-all
          ${copied ? 'bg-green-600/20 border-green-600/50 text-green-400' : ''}
          ${className}
        `}
      >
        {copied ? (
          <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
        <span>{copied ? successMessage : label}</span>
      </button>
    );
  }

  // Icon variant (default)
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        ${sizeClasses[size]} rounded-lg
        text-gray-400 hover:text-white hover:bg-gray-800
        transition-all
        ${copied ? 'text-green-400' : ''}
        ${className}
      `}
      title={copied ? successMessage : label}
    >
      {copied ? (
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

/**
 * AddressDisplay - shows blockchain address with copy
 */
interface AddressDisplayProps {
  address: string;
  variant?: 'full' | 'short' | 'compact';
  showExplorer?: boolean;
  explorerUrl?: string;
  className?: string;
}

export function AddressDisplay({
  address,
  variant = 'short',
  showExplorer = true,
  explorerUrl,
  className = '',
}: AddressDisplayProps) {
  const displayAddress = () => {
    switch (variant) {
      case 'full':
        return address;
      case 'compact':
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
      case 'short':
      default:
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
  };

  const explorer = explorerUrl || `https://explorer.stacks.co/address/${address}`;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <code className="font-mono text-gray-300 text-sm bg-gray-800/50 px-2 py-1 rounded-lg">
        {displayAddress()}
      </code>
      <CopyButtonComponent text={address} size="sm" />
      {showExplorer && (
        <a
          href={explorer}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-400 hover:text-purple-400 transition-colors"
          title="View on Explorer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

/**
 * TransactionHash - shows tx hash with copy and explorer link
 */
interface TransactionHashProps {
  hash: string;
  status?: 'pending' | 'success' | 'failed';
  explorerUrl?: string;
  className?: string;
}

export function TransactionHash({
  hash,
  status,
  explorerUrl,
  className = '',
}: TransactionHashProps) {
  const statusColors = {
    pending: 'text-yellow-400',
    success: 'text-green-400',
    failed: 'text-red-400',
  };

  const statusIcons = {
    pending: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
    success: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    failed: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  const explorer = explorerUrl || `https://explorer.stacks.co/txid/${hash}`;
  const shortHash = `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {status && (
        <span className={statusColors[status]}>
          {statusIcons[status]}
        </span>
      )}
      <a
        href={explorer}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-purple-400 hover:text-purple-300 text-sm transition-colors"
      >
        {shortHash}
      </a>
      <CopyButtonComponent text={hash} size="sm" />
    </div>
  );
}

/**
 * CodeBlock - displays code with copy button
 */
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = false,
  className = '',
}: CodeBlockProps) {
  const lines = code.split('\n');

  return (
    <div className={`relative group rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{language}</span>
        <CopyButtonComponent text={code} size="sm" />
      </div>
      
      {/* Code */}
      <pre className="p-4 bg-gray-900 overflow-x-auto">
        <code className="text-sm font-mono text-gray-300">
          {showLineNumbers ? (
            lines.map((line, index) => (
              <div key={index} className="flex">
                <span className="select-none text-gray-600 w-8 flex-shrink-0 text-right pr-4">
                  {index + 1}
                </span>
                <span>{line}</span>
              </div>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}

/**
 * ShareButton - share content with copy fallback
 */
interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  className?: string;
}

export function ShareButton({
  title,
  text,
  url,
  className = '',
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback to copy
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl
        bg-gray-800/50 border border-gray-700
        text-gray-300 hover:text-white hover:border-gray-600
        transition-all
        ${shared ? 'bg-green-600/20 border-green-600/50 text-green-400' : ''}
        ${className}
      `}
    >
      {shared ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Shared!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
        </>
      )}
    </button>
  );
}

export default memo(CopyButtonComponent);
