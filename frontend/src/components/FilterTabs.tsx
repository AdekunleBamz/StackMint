'use client';

import { useState } from 'react';

interface FilterTabsProps {
  tabs: string[];
  onSelect: (tab: string) => void;
}

export default function FilterTabs({ tabs, onSelect }: FilterTabsProps) {
  const [active, setActive] = useState(tabs[0]);

  const handleSelect = (tab: string) => {
    setActive(tab);
    onSelect(tab);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleSelect(tab)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            active === tab 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
