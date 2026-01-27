'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';

/**
 * FilterTabs Component
 * Horizontal tab navigation with multiple style variants
 * @module components/FilterTabs
 * @version 2.1.0
 */

// Animation timing constants
const INDICATOR_TRANSITION_DURATION = 300;
const TAB_GAP_UNDERLINE = 6;
const TAB_GAP_PILLS = 3;

// Tab variant types
type TabVariant = 'default' | 'pills' | 'underline';

/**
 * Tab size configuration type
 */
type TabSize = 'sm' | 'md' | 'lg';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  disabled?: boolean;
}

interface FilterTabsProps {
  tabs: Tab[] | string[];
  onSelect: (tabId: string) => void;
  defaultTab?: string;
  variant?: TabVariant;
  ariaLabel?: string;
}

export default function FilterTabs({ 
  tabs, 
  onSelect, 
  defaultTab,
  variant = 'default' 
}: FilterTabsProps) {
  // Normalize tabs to always be Tab objects
  const normalizedTabs: Tab[] = tabs.map(tab => 
    typeof tab === 'string' ? { id: tab, label: tab } : tab
  );

  const [active, setActive] = useState(defaultTab || normalizedTabs[0]?.id);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update indicator position
  useEffect(() => {
    const activeIndex = normalizedTabs.findIndex(t => t.id === active);
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab && variant === 'underline') {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [active, normalizedTabs, variant]);

  const handleSelect = (tabId: string) => {
    setActive(tabId);
    onSelect(tabId);
  };

  if (variant === 'underline') {
    return (
      <div className="relative">
        <div className="flex gap-6 border-b border-gray-700/50">
          {normalizedTabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={el => tabRefs.current[index] = el}
              onClick={() => handleSelect(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                active === tab.id 
                  ? 'text-purple-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active === tab.id ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        {/* Animated underline indicator */}
        <div 
          className="absolute bottom-0 h-0.5 bg-purple-500 rounded-full transition-all duration-300"
          style={indicatorStyle}
        />
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className="flex gap-3 flex-wrap" role="tablist" aria-label="Filter options">
        {normalizedTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleSelect(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={active === tab.id}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              tab.disabled 
                ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                : active === tab.id 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 scale-105' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50 hover:scale-105'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${
                  active === tab.id ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className="inline-flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-700/50" role="tablist" aria-label="Filter options">
      {normalizedTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && handleSelect(tab.id)}
          disabled={tab.disabled}
          role="tab"
          aria-selected={active === tab.id}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            tab.disabled 
              ? 'text-gray-600 cursor-not-allowed'
              : active === tab.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${
                active === tab.id ? 'bg-white/20' : 'bg-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
