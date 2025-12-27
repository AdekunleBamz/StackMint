'use client';

import { useState } from 'react';

export default function Header() {
  const [connected, setConnected] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <span className="text-xl font-bold text-white">StacksMint</span>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
          {connected ? 'Connected' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
}
