'use client';

/**
 * ShareModal Component
 * Modal for sharing NFTs on social media and copying links
 * @module components/ShareModal
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  image?: string;
  description?: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  getUrl: (url: string, title: string, description: string) => string;
}

const shareOptions: ShareOption[] = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '𝕏',
    color: 'bg-black hover:bg-gray-800',
    getUrl: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '💬',
    color: 'bg-[#5865F2] hover:bg-[#4752C4]',
    getUrl: (url) => url, // Discord doesn't have direct share URL
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-[#0088cc] hover:bg-[#0077b5]',
    getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-[#1877f2] hover:bg-[#166fe5]',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🔴',
    color: 'bg-[#ff4500] hover:bg-[#e03d00]',
    getUrl: (url, title) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    color: 'bg-gray-600 hover:bg-gray-500',
    getUrl: (url, title, description) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`,
  },
];

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  image,
  description = 'Check out this amazing NFT on StacksMint!',
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [url]);

  const handleCopyEmbed = useCallback(async () => {
    const embedCode = `<iframe src="${url}/embed" width="350" height="500" frameborder="0" allowfullscreen></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [url]);

  const handleShare = useCallback((option: ShareOption) => {
    const shareUrl = option.getUrl(url, title, description);
    if (option.id === 'discord') {
      // Copy to clipboard for Discord
      navigator.clipboard.writeText(`${title}\n${url}`);
      alert('Link copied! Paste it in Discord.');
    } else if (option.id === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }, [url, title, description]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Share</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Preview */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-4">
            {image ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🎨</span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{title}</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{description}</p>
            </div>
          </div>
        </div>
        
        {/* Social Share Buttons */}
        <div className="p-4 border-b border-gray-800">
          <p className="text-sm text-gray-400 mb-3">Share to</p>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleShare(option)}
                className={`${option.color} rounded-xl p-3 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95`}
              >
                <span className="text-xl">{option.icon}</span>
                <span className="text-xs text-white font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Copy Link */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-400">Or copy link</p>
          
          {/* Link input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white truncate focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          
          {/* Embed code */}
          <details className="group">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors list-none flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Embed code
            </summary>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={`<iframe src="${url}/embed" ...>`}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-400 truncate focus:outline-none"
              />
              <button
                onClick={handleCopyEmbed}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  embedCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {embedCopied ? '✓' : 'Copy'}
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
