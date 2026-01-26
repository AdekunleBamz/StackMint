'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

// URI validation patterns
const VALID_URI_PREFIXES = ['ipfs://', 'https://'] as const;

export default function MintCard() {
  const [uri, setUri] = useState('');
  const [name, setName] = useState('');
  const { isConnected, connect } = useWallet();
  const { mint, loading, error } = useContract();

  const handleMint = async () => {
    if (!uri) return;
    await mint(uri);
    setUri('');
    setName('');
  };

  const isValidUri = useMemo(() => 
    VALID_URI_PREFIXES.some(prefix => uri.startsWith(prefix)),
    [uri]
  );

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-purple-500/20 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-sm shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Mint NFT</h3>
          <p className="text-sm text-gray-400">Create your unique asset</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">NFT Name</label>
          <input
            type="text"
            placeholder="My Awesome NFT"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Token URI</label>
          <input
            type="text"
            placeholder="ipfs://... or https://..."
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:outline-none transition-all ${
              uri && !isValidUri 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
            }`}
          />
          {uri && !isValidUri && (
            <p className="text-red-400 text-xs mt-1">URI must start with ipfs:// or https://</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Minting fee</span>
          <span className="text-purple-400 font-bold">0.01 STX</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Network</span>
          <span className="text-green-400 text-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Stacks Mainnet
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </div>
      )}

      <div className="mt-6">
        {isConnected ? (
          <button
            onClick={handleMint}
            disabled={loading || !uri || !isValidUri}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Minting...
              </>
            ) : (
              <>
                <span>🚀</span> Mint NFT
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => connect()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
          >
            <span>🔗</span> Connect Wallet to Mint
          </button>
        )}
      </div>
    </div>
  );
}
