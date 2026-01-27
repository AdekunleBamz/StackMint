'use client';

/**
 * ProfileHeader Component
 * User profile header with stats, banner, and actions
 * @module components/ProfileHeader
 * @version 1.0.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';

// Icons
const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Types
export interface ProfileStats {
  owned: number;
  created: number;
  collected: number;
  listed: number;
  totalVolume: number;
  followers: number;
  following: number;
}

export interface ProfileData {
  address: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  verified?: boolean;
  joinedAt?: Date;
  socials?: {
    twitter?: string;
    website?: string;
    discord?: string;
  };
  stats: ProfileStats;
}

// Truncate address
function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// Profile header props
interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  onFollowClick?: () => void;
  isFollowing?: boolean;
  className?: string;
}

export function ProfileHeader({
  profile,
  isOwnProfile = false,
  onEditClick,
  onFollowClick,
  isFollowing = false,
  className = '',
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [profile.address]);

  const handleShare = useCallback((platform: string) => {
    const profileUrl = `${window.location.origin}/profile/${profile.address}`;
    const text = `Check out ${profile.username || truncateAddress(profile.address)} on StacksMint!`;
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
      copy: profileUrl,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(profileUrl);
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
    
    setShowShareMenu(false);
  }, [profile]);

  return (
    <div className={`relative ${className}`}>
      {/* Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {profile.bannerUrl && (
          <img
            src={profile.bannerUrl}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Banner overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        {/* Edit banner button */}
        {isOwnProfile && (
          <button
            onClick={onEditClick}
            className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-black/70 transition-colors flex items-center gap-2"
          >
            <EditIcon />
            Edit Banner
          </button>
        )}
      </div>

      {/* Profile info section */}
      <div className="max-w-6xl mx-auto px-4 relative -mt-20">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gray-800 border-4 border-gray-900 overflow-hidden shadow-xl">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {(profile.username || profile.address)[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Verified badge */}
            {profile.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                <CheckIcon />
              </div>
            )}
            
            {/* Edit avatar button */}
            {isOwnProfile && (
              <button
                onClick={onEditClick}
                className="absolute bottom-2 right-2 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <EditIcon />
              </button>
            )}
          </div>

          {/* Profile details */}
          <div className="flex-1 min-w-0 pt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {/* Username */}
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  {profile.username || truncateAddress(profile.address)}
                  {profile.verified && (
                    <span className="text-blue-400" title="Verified">✓</span>
                  )}
                </h1>

                {/* Address */}
                <button
                  onClick={copyAddress}
                  className="mt-1 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span className="font-mono text-sm">
                    {truncateAddress(profile.address)}
                  </span>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied && <span className="text-xs text-green-400">Copied!</span>}
                </button>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-3 text-gray-400 max-w-lg">
                    {profile.bio}
                  </p>
                )}

                {/* Joined date */}
                {profile.joinedAt && (
                  <p className="mt-2 text-sm text-gray-500">
                    Joined {profile.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}

                {/* Social links */}
                {profile.socials && Object.keys(profile.socials).length > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    {profile.socials.twitter && (
                      <a
                        href={`https://twitter.com/${profile.socials.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {profile.socials.website && (
                      <a
                        href={profile.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        🌐
                      </a>
                    )}
                    {profile.socials.discord && (
                      <span className="text-gray-400">
                        Discord: {profile.socials.discord}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={onEditClick}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <EditIcon />
                      Edit Profile
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <SettingsIcon />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onFollowClick}
                    className={`
                      px-6 py-2 rounded-lg font-semibold transition-colors
                      ${isFollowing
                        ? 'bg-gray-800 text-white hover:bg-red-500/20 hover:text-red-400'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                      }
                    `}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

                {/* Share button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ShareIcon />
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-10">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>𝕏</span>
                        Share on X
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                      >
                        <CopyIcon />
                        Copy link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6 md:gap-10">
              <StatItem label="Owned" value={profile.stats.owned} />
              <StatItem label="Created" value={profile.stats.created} />
              <StatItem label="Collected" value={profile.stats.collected} />
              <StatItem label="Volume" value={`${profile.stats.totalVolume} STX`} />
              <StatItem label="Followers" value={profile.stats.followers} />
              <StatItem label="Following" value={profile.stats.following} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat item component
interface StatItemProps {
  label: string;
  value: number | string;
}

function StatItem({ label, value }: StatItemProps) {
  const displayValue = typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <div className="text-center md:text-left">
      <p className="text-xl md:text-2xl font-bold text-white">{displayValue}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export default ProfileHeader;
