'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  type KeyboardEvent,
} from 'react';

/**
 * Tabs Component
 * Accessible tabbed interface with keyboard navigation
 * @module components/Tabs
 * @version 2.0.0
 */

// ============================================================================
// Constants
// ============================================================================

/** Tab panel transition duration */
const PANEL_TRANSITION_DURATION = 200;

/** Keyboard navigation keys */
const TAB_KEYS = {
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  HOME: 'Home',
  END: 'End',
} as const;

// ============================================================================
// Types
// ============================================================================

type TabsVariant = 'default' | 'pills' | 'underline' | 'enclosed';
type TabsSize = 'sm' | 'md' | 'lg';
type TabsOrientation = 'horizontal' | 'vertical';

/**
 * Tab activation mode
 */
type TabActivation = 'automatic' | 'manual';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  baseId: string;
}

interface TabsProps {
  children: ReactNode;
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  className?: string;
}

interface TabListProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

interface TabProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  className?: string;
}

interface TabPanelProps {
  id: string;
  children: ReactNode;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<TabsVariant, { list: string; tab: string; activeTab: string }> = {
  default: {
    list: 'border-b border-gray-700',
    tab: 'border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600',
    activeTab: 'border-orange-500 text-orange-400',
  },
  pills: {
    list: 'bg-gray-800/50 rounded-lg p-1',
    tab: 'rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50',
    activeTab: 'bg-gray-700 text-white shadow-sm',
  },
  underline: {
    list: '',
    tab: 'text-gray-400 hover:text-white relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent hover:after:bg-gray-600',
    activeTab: 'text-orange-400 after:bg-orange-500',
  },
  enclosed: {
    list: 'border-b border-gray-700',
    tab: 'border border-transparent rounded-t-lg text-gray-400 hover:text-white hover:bg-gray-800/50 -mb-px',
    activeTab: 'bg-gray-900 border-gray-700 border-b-gray-900 text-white',
  },
};

const sizeStyles: Record<TabsSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const orientationStyles: Record<TabsOrientation, { container: string; list: string }> = {
  horizontal: {
    container: 'flex flex-col',
    list: 'flex flex-row',
  },
  vertical: {
    container: 'flex flex-row',
    list: 'flex flex-col border-r border-gray-700 pr-4 mr-4 min-w-[200px]',
  },
};

// ============================================================================
// Tabs Component
// ============================================================================

export function Tabs({
  children,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || '');
  const baseId = useId();

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const setActiveTab = useCallback(
    (id: string) => {
      if (!isControlled) {
        setInternalActiveTab(id);
      }
      onChange?.(id);
    },
    [isControlled, onChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, size, orientation, baseId }}>
      <div className={`${orientationStyles[orientation].container} ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// TabList Component
// ============================================================================

export function TabList({ children, className = '', ariaLabel = 'Tabs' }: TabListProps) {
  const { variant, orientation } = useTabsContext();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      e.currentTarget.querySelectorAll('[role="tab"]:not([disabled])')
    ) as HTMLButtonElement[];
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);

    let nextIndex: number | null = null;

    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    switch (e.key) {
      case prevKey:
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case nextKey:
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      tabs[nextIndex].focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={`
        ${orientationStyles[orientation].list}
        ${variantStyles[variant].list}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tab Component
// ============================================================================

export function Tab({
  id,
  children,
  disabled = false,
  icon,
  badge,
  className = '',
}: TabProps) {
  const { activeTab, setActiveTab, variant, size, baseId } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      id={`${baseId}-tab-${id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2
        font-medium
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
        ${sizeStyles[size]}
        ${variantStyles[variant].tab}
        ${isActive ? variantStyles[variant].activeTab : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          className={`
            ml-1 px-2 py-0.5 text-xs font-medium rounded-full
            ${isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-400'}
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// TabPanel Component
// ============================================================================

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const { activeTab, baseId } = useTabsContext();
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      id={`${baseId}-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${id}`}
      tabIndex={0}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TabPanels Container
// ============================================================================

interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

export function TabPanels({ children, className = '' }: TabPanelsProps) {
  return <div className={`py-4 ${className}`}>{children}</div>;
}

// ============================================================================
// Simple Tabs (Pre-configured)
// ============================================================================

interface SimpleTabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface SimpleTabsProps {
  tabs: SimpleTabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
}

export function SimpleTabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
}: SimpleTabsProps) {
  const defaultTabId = defaultTab || tabs[0]?.id;

  return (
    <Tabs defaultTab={defaultTabId} onChange={onChange} variant={variant} size={size} className={className}>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.id} id={tab.id} icon={tab.icon} badge={tab.badge} disabled={tab.disabled}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab) => (
          <TabPanel key={tab.id} id={tab.id}>
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

// ============================================================================
// NFT Tabs (Pre-configured for NFT pages)
// ============================================================================

interface NFTTabsProps {
  details?: ReactNode;
  properties?: ReactNode;
  history?: ReactNode;
  offers?: ReactNode;
  className?: string;
}

export function NFTTabs({
  details,
  properties,
  history,
  offers,
  className = '',
}: NFTTabsProps) {
  const tabs: SimpleTabItem[] = [
    { id: 'details', label: 'Details', content: details || <p className="text-gray-400">No details available</p> },
    {
      id: 'properties',
      label: 'Properties',
      content: properties || <p className="text-gray-400">No properties</p>,
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: history || <p className="text-gray-400">No history yet</p>,
    },
  ];

  if (offers) {
    tabs.push({
      id: 'offers',
      label: 'Offers',
      badge: '0',
      content: offers,
    });
  }

  return <SimpleTabs tabs={tabs} variant="underline" className={className} />;
}

// ============================================================================
// Profile Tabs (Pre-configured for profile pages)
// ============================================================================

interface ProfileTabsProps {
  owned?: ReactNode;
  created?: ReactNode;
  favorites?: ReactNode;
  activity?: ReactNode;
  counts?: {
    owned?: number;
    created?: number;
    favorites?: number;
  };
  className?: string;
}

export function ProfileTabs({
  owned,
  created,
  favorites,
  activity,
  counts = {},
  className = '',
}: ProfileTabsProps) {
  const tabs: SimpleTabItem[] = [
    {
      id: 'owned',
      label: 'Owned',
      badge: counts.owned,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      content: owned || <p className="text-gray-400">No NFTs owned</p>,
    },
    {
      id: 'created',
      label: 'Created',
      badge: counts.created,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      content: created || <p className="text-gray-400">No NFTs created</p>,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      badge: counts.favorites,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      content: favorites || <p className="text-gray-400">No favorites yet</p>,
    },
  ];

  if (activity) {
    tabs.push({
      id: 'activity',
      label: 'Activity',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      content: activity,
    });
  }

  return <SimpleTabs tabs={tabs} variant="pills" className={className} />;
}

// ============================================================================
// Marketplace Filter Tabs
// ============================================================================

interface FilterTabsItem {
  id: string;
  label: string;
  count?: number;
}

interface MarketplaceFilterTabsProps {
  tabs: FilterTabsItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function MarketplaceFilterTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
}: MarketplaceFilterTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-orange-600' : 'bg-gray-700'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
