'use client';

/**
 * ProfileCard Component
 * User profile display components
 * @module components/ProfileCard
 * @version 1.0.0
 */

import { memo, useState } from 'react';

interface UserProfile {
  address: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  verified?: boolean;
  joinedDate?: Date;
  website?: string;
  twitter?: string;
  discord?: string;
  stats?: {
    nftsOwned: number;
    nftsCreated: number;
    collections: number;
    followers: number;
    following: number;
    totalVolume: number;
  };
}

interface ProfileCardProps {
  profile: UserProfile;
  variant?: 'full' | 'compact' | 'mini';
  showFollow?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  className?: string;
}

function ProfileCardComponent({
  profile,
  variant = 'full',
  showFollow = true,
  isFollowing = false,
  onFollow,
  onMessage,
  className = '',
}: ProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const shortAddress = `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(profile.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(2);
  };

  if (variant === 'mini') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName || shortAddress}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {(profile.displayName || profile.address)[0].toUpperCase()}
            </div>
          )}
          {profile.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-white flex items-center gap-1">
            {profile.displayName || shortAddress}
          </p>
          {profile.username && (
            <p className="text-sm text-gray-400">@{profile.username}</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`p-4 bg-gray-900/50 rounded-2xl border border-gray-800 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName || shortAddress}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {(profile.displayName || profile.address)[0].toUpperCase()}
              </div>
            )}
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate">
              {profile.displayName || shortAddress}
            </h3>
            {profile.username && (
              <p className="text-gray-400 text-sm">@{profile.username}</p>
            )}
            <button
              onClick={copyAddress}
              className="flex items-center gap-1 mt-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <code className="font-mono">{shortAddress}</code>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={copied ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
              </svg>
            </button>
          </div>

          {showFollow && onFollow && (
            <button
              onClick={onFollow}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all
                ${isFollowing 
                  ? 'bg-gray-800 text-gray-300 hover:bg-red-600/20 hover:text-red-400' 
                  : 'bg-purple-600 text-white hover:bg-purple-500'
                }
              `}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Stats */}
        {profile.stats && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="font-bold text-white">{profile.stats.followers.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-white">{profile.stats.following.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-white">{profile.stats.nftsOwned}</p>
              <p className="text-xs text-gray-500">NFTs</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 relative">
        {profile.banner && (
          <img
            src={profile.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName || shortAddress}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-900"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-gray-900 flex items-center justify-center text-white text-3xl font-bold">
              {(profile.displayName || profile.address)[0].toUpperCase()}
            </div>
          )}
          {profile.verified && (
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-gray-900">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Name and Address */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {profile.displayName || shortAddress}
            </h2>
            {profile.username && (
              <p className="text-gray-400">@{profile.username}</p>
            )}
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 mt-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <code className="font-mono">{shortAddress}</code>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={copied ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
              </svg>
              {copied && <span className="text-green-400">Copied!</span>}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onMessage && (
              <button
                onClick={onMessage}
                className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
            {showFollow && onFollow && (
              <button
                onClick={onFollow}
                className={`
                  px-6 py-2 rounded-xl font-medium transition-all
                  ${isFollowing 
                    ? 'bg-gray-800 text-gray-300 hover:bg-red-600/20 hover:text-red-400' 
                    : 'bg-purple-600 text-white hover:bg-purple-500'
                  }
                `}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-gray-300">{profile.bio}</p>
        )}

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-4">
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          )}
          {profile.twitter && (
            <a
              href={`https://twitter.com/${profile.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @{profile.twitter}
            </a>
          )}
          {profile.discord && (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              {profile.discord}
            </span>
          )}
          {profile.joinedDate && (
            <span className="flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Joined {profile.joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Stats */}
        {profile.stats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.stats.nftsOwned}</p>
              <p className="text-xs text-gray-500">Owned</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.stats.nftsCreated}</p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.stats.collections}</p>
              <p className="text-xs text-gray-500">Collections</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.stats.followers.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{profile.stats.following.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{formatVolume(profile.stats.totalVolume)} STX</p>
              <p className="text-xs text-gray-500">Volume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ProfileBanner - editable banner
 */
interface ProfileBannerProps {
  bannerUrl?: string;
  avatarUrl?: string;
  displayName: string;
  onBannerChange?: (file: File) => void;
  onAvatarChange?: (file: File) => void;
  editable?: boolean;
  className?: string;
}

export function ProfileBanner({
  bannerUrl,
  avatarUrl,
  displayName,
  onBannerChange,
  onAvatarChange,
  editable = false,
  className = '',
}: ProfileBannerProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 relative">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
        {editable && onBannerChange && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Change Banner</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onBannerChange(e.target.files[0])}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-16 left-6">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-900"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-gray-900 flex items-center justify-center text-white text-4xl font-bold">
              {displayName[0].toUpperCase()}
            </div>
          )}
          {editable && onAvatarChange && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onAvatarChange(e.target.files[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProfileCardComponent);
