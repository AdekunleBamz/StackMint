'use client';

/**
 * FilterPanel Component
 * Advanced filtering for marketplace
 * @module components/FilterPanel
 * @version 1.0.0
 */

import { memo, useState, useCallback } from 'react';

// Types
export interface FilterState {
  priceRange: { min: number | null; max: number | null };
  categories: string[];
  collections: string[];
  status: ('listed' | 'auction' | 'offers' | 'not-listed')[];
  chains: string[];
  traits: Record<string, string[]>;
  sortBy: 'price-low' | 'price-high' | 'recent' | 'oldest' | 'ending-soon';
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  collections?: Array<{ id: string; name: string; count: number }>;
  traits?: Array<{ name: string; values: Array<{ value: string; count: number }> }>;
  onClear?: () => void;
  collapsible?: boolean;
  className?: string;
}

const CATEGORIES = [
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'video', label: 'Video', emoji: '🎬' },
  { id: 'collectibles', label: 'Collectibles', emoji: '🃏' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'pfp', label: 'PFP', emoji: '👤' },
  { id: 'generative', label: 'Generative', emoji: '🌀' },
];

const STATUS_OPTIONS = [
  { id: 'listed', label: 'For Sale' },
  { id: 'auction', label: 'On Auction' },
  { id: 'offers', label: 'Has Offers' },
  { id: 'not-listed', label: 'Not Listed' },
] as const;

function FilterPanelComponent({
  filters,
  onChange,
  collections = [],
  traits = [],
  onClear,
  collapsible = true,
  className = '',
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'status',
    'price',
    'categories',
  ]);

  const toggleSection = useCallback((section: string) => {
    if (!collapsible) return;
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, [collapsible]);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  const toggleArrayFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated as FilterState[K]);
  }, [filters, updateFilter]);

  const toggleStatus = useCallback((status: FilterState['status'][number]) => {
    const current = filters.status;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateFilter('status', updated);
  }, [filters.status, updateFilter]);

  const hasActiveFilters = 
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null ||
    filters.categories.length > 0 ||
    filters.collections.length > 0 ||
    filters.status.length > 0 ||
    Object.keys(filters.traits).length > 0;

  const SectionHeader = ({ id, title, count }: { id: string; title: string; count?: number }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-3 text-left"
    >
      <span className="font-medium text-white">
        {title}
        {count !== undefined && count > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded-full">
            {count}
          </span>
        )}
      </span>
      {collapsible && (
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.includes(id) ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className={`bg-gray-900/50 rounded-2xl border border-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="font-semibold text-lg text-white">Filters</h3>
        {hasActiveFilters && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-800">
        {/* Status */}
        <div className="px-4">
          <SectionHeader id="status" title="Status" count={filters.status.length} />
          {(!collapsible || expandedSections.includes('status')) && (
            <div className="pb-4 space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.id)}
                    onChange={() => toggleStatus(status.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="text-gray-300">{status.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="px-4">
          <SectionHeader id="price" title="Price" />
          {(!collapsible || expandedSections.includes('price')) && (
            <div className="pb-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min ?? ''}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      min: e.target.value ? parseFloat(e.target.value) : null,
                    })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="flex items-center text-gray-500">to</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max ?? ''}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      max: e.target.value ? parseFloat(e.target.value) : null,
                    })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Price in STX</p>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="px-4">
          <SectionHeader id="categories" title="Categories" count={filters.categories.length} />
          {(!collapsible || expandedSections.includes('categories')) && (
            <div className="pb-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleArrayFilter('categories', category.id)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                    border transition-all
                    ${filters.categories.includes(category.id)
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }
                  `}
                >
                  <span>{category.emoji}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div className="px-4">
            <SectionHeader id="collections" title="Collections" count={filters.collections.length} />
            {(!collapsible || expandedSections.includes('collections')) && (
              <div className="pb-4 space-y-2 max-h-48 overflow-y-auto">
                {collections.map((collection) => (
                  <label
                    key={collection.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.collections.includes(collection.id)}
                      onChange={() => toggleArrayFilter('collections', collection.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <span className="flex-1 text-gray-300 truncate">{collection.name}</span>
                    <span className="text-sm text-gray-500">{collection.count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Traits */}
        {traits.map((trait) => (
          <div key={trait.name} className="px-4">
            <SectionHeader 
              id={`trait-${trait.name}`} 
              title={trait.name}
              count={filters.traits[trait.name]?.length || 0}
            />
            {(!collapsible || expandedSections.includes(`trait-${trait.name}`)) && (
              <div className="pb-4 space-y-2 max-h-48 overflow-y-auto">
                {trait.values.map((value) => (
                  <label
                    key={value.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.traits[trait.name]?.includes(value.value) || false}
                      onChange={() => {
                        const currentTraitValues = filters.traits[trait.name] || [];
                        const updatedValues = currentTraitValues.includes(value.value)
                          ? currentTraitValues.filter(v => v !== value.value)
                          : [...currentTraitValues, value.value];
                        
                        const updatedTraits = { ...filters.traits };
                        if (updatedValues.length === 0) {
                          delete updatedTraits[trait.name];
                        } else {
                          updatedTraits[trait.name] = updatedValues;
                        }
                        updateFilter('traits', updatedTraits);
                      }}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <span className="flex-1 text-gray-300 truncate">{value.value}</span>
                    <span className="text-sm text-gray-500">{value.count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * FilterChips - shows active filters as removable chips
 */
interface FilterChipsProps {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className = '',
}: FilterChipsProps) {
  const chips: Array<{ key: keyof FilterState; label: string; value?: string }> = [];

  // Price range
  if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
    const label = filters.priceRange.min !== null && filters.priceRange.max !== null
      ? `${filters.priceRange.min} - ${filters.priceRange.max} STX`
      : filters.priceRange.min !== null
        ? `Min ${filters.priceRange.min} STX`
        : `Max ${filters.priceRange.max} STX`;
    chips.push({ key: 'priceRange', label });
  }

  // Categories
  filters.categories.forEach(cat => {
    const category = CATEGORIES.find(c => c.id === cat);
    if (category) {
      chips.push({ key: 'categories', label: category.label, value: cat });
    }
  });

  // Status
  filters.status.forEach(status => {
    const option = STATUS_OPTIONS.find(s => s.id === status);
    if (option) {
      chips.push({ key: 'status', label: option.label, value: status });
    }
  });

  // Collections
  filters.collections.forEach(col => {
    chips.push({ key: 'collections', label: col, value: col });
  });

  // Traits
  Object.entries(filters.traits).forEach(([traitName, values]) => {
    values.forEach(value => {
      chips.push({ key: 'traits', label: `${traitName}: ${value}`, value: `${traitName}:${value}` });
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {chips.map((chip, index) => (
        <button
          key={`${chip.key}-${chip.value || index}`}
          type="button"
          onClick={() => onRemove(chip.key, chip.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm hover:bg-purple-600/30 transition-colors"
        >
          {chip.label}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
      
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

/**
 * MobileFilterDrawer - filter panel as slide-in drawer
 */
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-gray-900 z-50 lg:hidden overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

export default memo(FilterPanelComponent);
