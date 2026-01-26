'use client';

import { useState } from 'react';
import Link from 'next/link';
import CollectionCard from './CollectionCard';

const mockCollections = [
  { name: 'Stacks Punks', creator: 'SP1ABC...', itemCount: 100, featured: true },
  { name: 'Bitcoin Art', creator: 'SP2DEF...', itemCount: 50, featured: false },
  { name: 'Clarity Dreams', creator: 'SP3GHI...', itemCount: 75, featured: true },
  { name: 'Block Heroes', creator: 'SP4JKL...', itemCount: 200, featured: false },
  { name: 'Stacks OGs', creator: 'SP5MNO...', itemCount: 88, featured: true },
  { name: 'Pixel Miners', creator: 'SP6PQR...', itemCount: 150, featured: false },
];

type FilterType = 'all' | 'featured' | 'new';

export default function NFTGrid() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (newFilter: FilterType) => {
    setIsLoading(true);
    setFilter(newFilter);
    // Simulate loading for smooth transition
    setTimeout(() => setIsLoading(false), 300);
  };

  const filteredCollections = filter === 'featured' 
    ? mockCollections.filter(c => c.featured)
    : mockCollections;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Popular Collections</h2>
            <p className="text-gray-400">Discover trending NFT collections on Stacks</p>
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-700/50">
            {(['all', 'featured', 'new'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          {filteredCollections.map((collection, index) => (
            <div 
              key={collection.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CollectionCard {...collection} />
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-12 text-center">
          <Link 
            href="/collections"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors group"
          >
            View All Collections
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
