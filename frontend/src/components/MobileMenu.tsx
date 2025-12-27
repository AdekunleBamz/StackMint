'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2"
      >
        {isOpen ? '✕' : '☰'}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-purple-500/20 py-4">
          <nav className="flex flex-col items-center gap-4 text-gray-300">
            <Link href="/mint" onClick={() => setIsOpen(false)} className="hover:text-purple-500">Mint</Link>
            <Link href="/collections" onClick={() => setIsOpen(false)} className="hover:text-purple-500">Collections</Link>
            <Link href="/marketplace" onClick={() => setIsOpen(false)} className="hover:text-purple-500">Marketplace</Link>
            <Link href="/profile" onClick={() => setIsOpen(false)} className="hover:text-purple-500">Profile</Link>
          </nav>
        </div>
      )}
    </div>
  );
}
