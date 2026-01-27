'use client';

/**
 * CollectionFilter Component
 * Advanced filtering panel for NFT collections with multiple filter types
 * @module components/CollectionFilter
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';

/** Default price range */
const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000];

/** Rarity levels */
const RARITY_LEVELS = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'] as const;

/** Status options */
const STATUS_OPTIONS = ['Buy Now', 'On Auction', 'New', 'Has Offers'] as const;

type RarityLevel = typeof RARITY_LEVELS[number];
type StatusOption = typeof STATUS_OPTIONS[number];

/**
 * Trait filter type
 */
interface TraitFilter {
  traitType: string;
  values: string[];
  counts?: Record<string, number>;
}

/**
 * Filter state
 */
export interface FilterState {
  priceRange: [number, number];
  rarities: RarityLevel[];
  statuses: StatusOption[];
  traits: Record<string, string[]>;
  currency: 'STX' | 'USD';
  sortBy: string;
}

interface CollectionFilterProps {
  /** Available traits for filtering */
  availableTraits?: TraitFilter[];
  /** Current filter state */
  filters: FilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterState) => void;
  /** Total results count */
  resultsCount?: number;
  /** Whether in mobile drawer mode */
  isMobile?: boolean;
  /** Callback to close mobile drawer */
  onClose?: () => void;
  /** Maximum price for range */
  maxPrice?: number;
  /** Enable/disable specific filter sections */
  enabledFilters?: {
    price?: boolean;
    rarity?: boolean;
    status?: boolean;
    traits?: boolean;
  };
}

/**
 * Rarity color mapping
 */
const rarityColors: Record<RarityLevel, { bg: string; text: string; border: string }> = {
  Common: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  Uncommon: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  Rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Legendary: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  Mythic: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
};

/**
 * CollectionFilter - Advanced filtering panel for collections
 */
export default function CollectionFilter({
  availableTraits = [],
  filters,
  onFiltersChange,
  resultsCount,
  isMobile = false,
  onClose,
  maxPrice = 1000,
  enabledFilters = { price: true, rarity: true, status: true, traits: true },
}: CollectionFilterProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    rarity: true,
    status: false,
    ...Object.fromEntries(availableTraits.map(t => [t.traitType, false])),
  });

  const [localPriceMin, setLocalPriceMin] = useState(filters.priceRange[0].toString());
  const [localPriceMax, setLocalPriceMax] = useState(filters.priceRange[1].toString());

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Update filters helper
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  }, [filters, onFiltersChange]);

  // Toggle rarity
  const toggleRarity = (rarity: RarityLevel) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    updateFilters({ rarities: newRarities });
  };

  // Toggle status
  const toggleStatus = (status: StatusOption) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    updateFilters({ statuses: newStatuses });
  };

  // Toggle trait value
  const toggleTraitValue = (traitType: string, value: string) => {
    const currentValues = filters.traits[traitType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    const newTraits = { ...filters.traits };
    if (newValues.length === 0) {
      delete newTraits[traitType];
    } else {
      newTraits[traitType] = newValues;
    }
    updateFilters({ traits: newTraits });
  };

  // Apply price range
  const applyPriceRange = () => {
    const min = parseFloat(localPriceMin) || 0;
    const max = parseFloat(localPriceMax) || maxPrice;
    updateFilters({ priceRange: [Math.min(min, max), Math.max(min, max)] });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: DEFAULT_PRICE_RANGE,
      rarities: [],
      statuses: [],
      traits: {},
      currency: 'STX',
      sortBy: 'recent',
    });
    setLocalPriceMin('0');
    setLocalPriceMax(maxPrice.toString());
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    count += filters.rarities.length;
    count += filters.statuses.length;
    count += Object.keys(filters.traits).length;
    return count;
  }, [filters, maxPrice]);

  // Section component
  const FilterSection = ({ 
    id, 
    title, 
    children, 
    badge 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode;
    badge?: number;
  }) => (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{title}</span>
          {badge && badge > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            expandedSections[id] ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expandedSections[id] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const containerClass = isMobile
    ? 'fixed inset-0 z-50 bg-gray-900'
    : 'bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-sm bg-purple-500/20 text-purple-400 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className={isMobile ? 'overflow-y-auto' : ''} style={isMobile ? { height: 'calc(100vh - 140px)' } : undefined}>
        {/* Price Range */}
        {enabledFilters.price && (
          <FilterSection 
            id="price" 
            title="Price" 
            badge={filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0}
          >
            <div className="space-y-4">
              {/* Currency Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilters({ currency: 'STX' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.currency === 'STX'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  STX
                </button>
                <button
                  onClick={() => updateFilters({ currency: 'USD' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.currency === 'USD'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  USD
                </button>
              </div>

              {/* Min/Max Inputs */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={localPriceMin}
                    onChange={(e) => setLocalPriceMin(e.target.value)}
                    onBlur={applyPriceRange}
                    placeholder="0"
                    min={0}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-gray-500 pt-5">to</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={localPriceMax}
                    onChange={(e) => setLocalPriceMax(e.target.value)}
                    onBlur={applyPriceRange}
                    placeholder={maxPrice.toString()}
                    min={0}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyPriceRange}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </FilterSection>
        )}

        {/* Rarity */}
        {enabledFilters.rarity && (
          <FilterSection 
            id="rarity" 
            title="Rarity" 
            badge={filters.rarities.length}
          >
            <div className="grid grid-cols-2 gap-2">
              {RARITY_LEVELS.map((rarity) => {
                const isSelected = filters.rarities.includes(rarity);
                const colors = rarityColors[rarity];
                return (
                  <button
                    key={rarity}
                    onClick={() => toggleRarity(rarity)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border}`
                        : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700'
                    }`}
                  >
                    {rarity}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Status */}
        {enabledFilters.status && (
          <FilterSection 
            id="status" 
            title="Status" 
            badge={filters.statuses.length}
          >
            <div className="space-y-2">
              {STATUS_OPTIONS.map((status) => {
                const isSelected = filters.statuses.includes(status);
                return (
                  <label
                    key={status}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-300">{status}</span>
                  </label>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Trait Filters */}
        {enabledFilters.traits && availableTraits.map((trait) => (
          <FilterSection
            key={trait.traitType}
            id={trait.traitType}
            title={trait.traitType}
            badge={filters.traits[trait.traitType]?.length || 0}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {trait.values.map((value) => {
                const isSelected = filters.traits[trait.traitType]?.includes(value);
                const count = trait.counts?.[value];
                return (
                  <label
                    key={value}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-300 truncate">{value}</span>
                    </div>
                    {count !== undefined && (
                      <span className="text-xs text-gray-500">{count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </FilterSection>
        ))}
      </div>

      {/* Footer - Mobile Only */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Show {resultsCount !== undefined ? resultsCount : ''} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
