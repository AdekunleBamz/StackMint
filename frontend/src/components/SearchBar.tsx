'use client';

import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ placeholder = 'Search NFTs...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 pl-10 text-white focus:border-purple-500 focus:outline-none"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
    </form>
  );
}
