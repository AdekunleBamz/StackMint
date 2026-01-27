'use client';

/**
 * MintCard Component
 * NFT minting form with URI validation and status feedback
 * @module MintCard
 * @version 2.4.0
 */

import { useState, useMemo, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

// URI validation patterns
const VALID_URI_PREFIXES = ['ipfs://', 'https://'] as const;
type ValidUriPrefix = typeof VALID_URI_PREFIXES[number];

// Input placeholder texts
const NAME_PLACEHOLDER = 'My Awesome NFT';
const URI_PLACEHOLDER = 'ipfs://... or https://...';

/** Maximum NFT name length */
const MAX_NAME_LENGTH = 64;

/** Maximum URI length */
const MAX_URI_LENGTH = 256;

/**
 * Minting status for UI feedback
 */
type MintStatus = 'idle' | 'validating' | 'minting' | 'success' | 'error';

/**
 * Mint form validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export default function MintCard() {
  const [uri, setUri] = useState('');
  const [name, setName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { isConnected, connect } = useWallet();
  const { mint, loading, error } = useContract();

  const handleMint = async () => {
    if (!uri) return;
    await mint(uri);
    setUri('');
    setName('');
    setQuantity(1);
  };

  const isValidUri = useMemo(() => 
    VALID_URI_PREFIXES.some(prefix => uri.startsWith(prefix)),
    [uri]
  );

  const totalCost = useMemo(() => (0.01 * quantity).toFixed(2), [quantity]);

  return (
    <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/70 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-500 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Mint NFT</h3>
            <p className="text-sm text-gray-400">Create your unique digital asset</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="group">
            <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-base">📝</span>
                NFT Name
              </span>
              <span className="text-xs text-gray-500">{name.length}/{MAX_NAME_LENGTH}</span>
            </label>
            <input
              type="text"
              placeholder="My Awesome NFT"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all hover:border-gray-600"
            />
          </div>

          <div className="group">
            <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span className="flex items-center gap-2">
                <span className="text-base">🔗</span>
                Token URI
              </span>
              {uri && isValidUri && (
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              )}
            </label>
            <input
              type="text"
              placeholder="ipfs://... or https://..."
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:outline-none transition-all hover:border-gray-600 ${
                uri && !isValidUri 
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-700/50 focus:border-purple-500 focus:ring-purple-500/20'
              }`}
            />
            {uri && !isValidUri && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span> URI must start with ipfs:// or https://
              </p>
            )}
            {uri && isValidUri && (
              <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                <span>✓</span> Valid URI format
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <span className="text-base">🔢</span>
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-12 h-12 bg-black/40 border border-gray-700/50 rounded-xl text-white text-xl font-bold hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                min={1}
                max={10}
                className="flex-1 bg-black/40 border border-gray-700/50 rounded-xl px-4 py-3.5 text-white text-center text-lg font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={quantity >= 10}
                className="w-12 h-12 bg-black/40 border border-gray-700/50 rounded-xl text-white text-xl font-bold hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Max 10 per transaction</p>
          </div>
        </div>

      <div className="mt-8 p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 flex items-center gap-2">
            <span>💰</span> Minting fee
          </span>
          <span className="text-white font-semibold">0.01 STX × {quantity}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 flex items-center gap-2">
            <span>🌐</span> Network
          </span>
          <span className="text-green-400 text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Stacks Mainnet
          </span>
        </div>
        <div className="border-t border-purple-500/20 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">Total Cost</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">{totalCost} STX</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </div>
      )}

      <div className="mt-6">
        {isConnected ? (
          <button
            onClick={handleMint}
            disabled={loading || !uri || !isValidUri || !name}
            className="group relative w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000" />
            </div>
            
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Minting {quantity} NFT{quantity > 1 ? 's' : ''}...</span>
              </>
            ) : (
              <>
                <span>🚀</span> Mint {quantity} NFT{quantity > 1 ? 's' : ''}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => connect()}
            className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-2 overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000" />
            </div>
            <span>🔗</span> Connect Wallet to Mint
          </button>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          💡 Pro tip: Use IPFS for permanent, decentralized storage of your NFT metadata
        </p>
      </div>
      </div>
    </div>
  );
}
