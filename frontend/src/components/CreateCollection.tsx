'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

export default function CreateCollection() {
  const [name, setName] = useState('');
  const [maxSupply, setMaxSupply] = useState('');
  const { isConnected, connect } = useWallet();
  const { create, loading, error } = useContract();

  const handleCreate = async () => {
    if (!name || !maxSupply) return;
    await create(name, parseInt(maxSupply));
    setName('');
    setMaxSupply('');
  };

  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">Create Collection</h3>
      <input
        type="text"
        placeholder="Collection Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:border-purple-500 focus:outline-none"
      />
      <input
        type="number"
        placeholder="Max Supply"
        value={maxSupply}
        onChange={(e) => setMaxSupply(e.target.value)}
        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:border-purple-500 focus:outline-none"
      />
      <div className="text-sm text-gray-400 mb-4">
        Creation fee: <span className="text-purple-500 font-semibold">0.01 STX</span>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {isConnected ? (
        <button
          onClick={handleCreate}
          disabled={loading || !name || !maxSupply}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? 'Creating...' : 'Create Collection'}
        </button>
      ) : (
        <button onClick={connect} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
