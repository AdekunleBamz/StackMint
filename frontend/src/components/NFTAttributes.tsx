'use client';

/**
 * NFTAttributes Component
 * Display NFT traits and properties with rarity percentages
 * @module components/NFTAttributes
 * @version 1.0.0
 */

import { memo } from 'react';

interface Attribute {
  trait_type: string;
  value: string | number;
  rarity?: number; // Percentage of NFTs with this trait
  display_type?: 'string' | 'number' | 'date' | 'boost_percentage' | 'boost_number';
}

interface NFTAttributesProps {
  attributes: Attribute[];
  columns?: 2 | 3 | 4;
  showRarity?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

// Rarity tier configuration
function getRarityTier(percentage: number): { label: string; color: string; bg: string } {
  if (percentage <= 1) return { label: 'Legendary', color: 'text-orange-400', bg: 'bg-orange-500/10' };
  if (percentage <= 5) return { label: 'Epic', color: 'text-purple-400', bg: 'bg-purple-500/10' };
  if (percentage <= 10) return { label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-500/10' };
  if (percentage <= 25) return { label: 'Uncommon', color: 'text-green-400', bg: 'bg-green-500/10' };
  return { label: 'Common', color: 'text-gray-400', bg: 'bg-gray-500/10' };
}

function AttributeCard({ attribute, showRarity = true, variant = 'default' }: { attribute: Attribute; showRarity?: boolean; variant?: 'default' | 'compact' | 'detailed' }) {
  const rarityTier = attribute.rarity ? getRarityTier(attribute.rarity) : null;
  
  // Handle different display types
  const displayValue = () => {
    if (attribute.display_type === 'date' && typeof attribute.value === 'number') {
      return new Date(attribute.value * 1000).toLocaleDateString();
    }
    if (attribute.display_type === 'boost_percentage') {
      return `+${attribute.value}%`;
    }
    if (attribute.display_type === 'boost_number') {
      return `+${attribute.value}`;
    }
    return attribute.value;
  };
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
        <span className="text-sm text-gray-400">{attribute.trait_type}</span>
        <span className="text-sm font-medium text-white">{displayValue()}</span>
      </div>
    );
  }
  
  return (
    <div className={`group relative ${rarityTier?.bg || 'bg-gray-800/30'} rounded-xl p-3 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300`}>
      {/* Rarity indicator dot */}
      {showRarity && rarityTier && (
        <div className="absolute top-2 right-2">
          <span className={`w-2 h-2 rounded-full ${rarityTier.color.replace('text-', 'bg-')} inline-block`} />
        </div>
      )}
      
      {/* Trait type */}
      <p className="text-xs text-purple-400 uppercase tracking-wider font-medium mb-1">
        {attribute.trait_type}
      </p>
      
      {/* Value */}
      <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
        {displayValue()}
      </p>
      
      {/* Rarity percentage */}
      {showRarity && attribute.rarity !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className={rarityTier?.color}>{rarityTier?.label}</span>
            <span className="text-gray-500">{attribute.rarity.toFixed(1)}% have this</span>
          </div>
          {/* Rarity bar */}
          <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${rarityTier?.color.replace('text-', 'bg-')} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(attribute.rarity, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BoostAttribute({ attribute }: { attribute: Attribute }) {
  const value = Number(attribute.value);
  const isPercentage = attribute.display_type === 'boost_percentage';
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-xs text-blue-400 uppercase tracking-wider">{attribute.trait_type}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">+{value}{isPercentage ? '%' : ''}</span>
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NFTAttributesComponent({
  attributes,
  columns = 3,
  showRarity = true,
  variant = 'default',
}: NFTAttributesProps) {
  // Separate regular attributes from boosts
  const regularAttributes = attributes.filter(
    a => !a.display_type || !['boost_percentage', 'boost_number'].includes(a.display_type)
  );
  const boostAttributes = attributes.filter(
    a => a.display_type && ['boost_percentage', 'boost_number'].includes(a.display_type)
  );
  
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };
  
  if (variant === 'compact') {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span>📋</span> Properties
        </h3>
        <div className="space-y-1">
          {attributes.map((attr, index) => (
            <AttributeCard key={index} attribute={attr} showRarity={false} variant="compact" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Regular Attributes */}
      {regularAttributes.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏷️</span> Properties
            <span className="text-xs text-gray-500 font-normal">({regularAttributes.length})</span>
          </h3>
          <div className={`grid ${gridCols[columns]} gap-3`}>
            {regularAttributes.map((attr, index) => (
              <AttributeCard key={index} attribute={attr} showRarity={showRarity} variant={variant} />
            ))}
          </div>
        </div>
      )}
      
      {/* Boost Attributes */}
      {boostAttributes.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Stats
            <span className="text-xs text-gray-500 font-normal">({boostAttributes.length})</span>
          </h3>
          <div className="space-y-3">
            {boostAttributes.map((attr, index) => (
              <BoostAttribute key={index} attribute={attr} />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {attributes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-3xl block mb-2">📭</span>
          <p>No attributes found</p>
        </div>
      )}
    </div>
  );
}

export default memo(NFTAttributesComponent);
export type { Attribute };
