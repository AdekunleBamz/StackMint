'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

export default function MintCard() {
  const [uri, setUri] = useState('');
  const { isConnected, connect } = useWallet();
  const { mint, loading, error } = useContract();

  const handleMint = async () => {
    if (!uri) return;
    await mint(uri);
    setUri('');
  };

  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">Mint NFT</h3>
      <input
        type="text"
        placeholder="Token URI (IPFS link)"
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:border-purple-500 focus:outline-none"
      />
      <div className="text-sm text-gray-400 mb-4">
        Minting fee: <span className="text-purple-500 font-semibold">0.01 STX</span>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {isConnected ? (
        <button
          onClick={handleMint}
          disabled={loading || !uri}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
      ) : (
        <button
          onClick={() => connect()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
        >
          Connect Wallet to Mint
        </button>
      )}
    </div>
  );
}
