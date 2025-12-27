'use client';

import { useState } from 'react';

export default function MintCard() {
  const [uri, setUri] = useState('');
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    setMinting(true);
    // TODO: Implement minting
    setTimeout(() => setMinting(false), 2000);
  };

  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">Mint NFT</h3>
      <input
        type="text"
        placeholder="Token URI (IPFS link)"
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
      />
      <div className="text-sm text-gray-400 mb-4">
        Minting fee: <span className="text-purple-500">0.01 STX</span>
      </div>
      <button
        onClick={handleMint}
        disabled={minting}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-semibold"
      >
        {minting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  );
}
