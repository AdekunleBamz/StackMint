'use client';

/**
 * QuickActions Component
 * Quick action buttons and floating action menus
 * @module components/QuickActions
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';

// Icons
const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const CreateIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MintIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// Types
export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

// Floating Action Button
interface FABProps {
  actions: QuickAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'default' | 'mini';
  className?: string;
}

export function FloatingActionButton({
  actions,
  position = 'bottom-right',
  variant = 'default',
  className = '',
}: FABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  const buttonSize = variant === 'mini' ? 'w-12 h-12' : 'w-14 h-14';

  return (
    <div
      ref={menuRef}
      className={`fixed ${positionClasses[position]} z-40 ${className}`}
    >
      {/* Action menu */}
      <div
        className={`
          absolute bottom-full mb-2 right-0 flex flex-col-reverse gap-2
          transition-all duration-300
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            disabled={action.disabled}
            className={`
              flex items-center gap-3 px-4 py-2 rounded-full
              bg-gray-800 hover:bg-gray-700 text-white
              shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              transform ${isOpen ? 'translate-x-0' : 'translate-x-2'}
            `}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className={action.color || 'text-primary-400'}>
              {action.icon}
            </span>
            <span className="whitespace-nowrap font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${buttonSize} rounded-full
          bg-primary-500 hover:bg-primary-600
          text-white shadow-lg
          flex items-center justify-center
          transition-all duration-300
          ${isOpen ? 'rotate-45 bg-gray-700' : ''}
        `}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

// Quick action bar (horizontal)
interface ActionBarProps {
  actions: QuickAction[];
  variant?: 'default' | 'compact' | 'pill';
  className?: string;
}

export function QuickActionBar({
  actions,
  variant = 'default',
  className = '',
}: ActionBarProps) {
  if (variant === 'pill') {
    return (
      <div className={`flex items-center gap-2 p-2 bg-gray-800 rounded-full ${className}`}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              px-4 py-2 rounded-full flex items-center gap-2
              ${action.disabled
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : 'hover:bg-gray-700 bg-gray-800'
              }
              transition-colors
            `}
            title={action.label}
          >
            <span className={action.color || 'text-primary-400'}>
              {action.icon}
            </span>
            <span className="text-sm font-medium text-white">{action.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              p-2 rounded-lg
              ${action.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-800'
              }
              transition-colors
            `}
            title={action.label}
          >
            <span className={action.color || 'text-gray-400'}>
              {action.icon}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            bg-gray-800 hover:bg-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
        >
          <span className={action.color || 'text-primary-400'}>
            {action.icon}
          </span>
          <span className="text-sm font-medium text-white">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

// Speed dial component
interface SpeedDialProps {
  actions: QuickAction[];
  direction?: 'up' | 'down' | 'left' | 'right';
  icon?: React.ReactNode;
  className?: string;
}

export function SpeedDial({
  actions,
  direction = 'up',
  icon,
  className = '',
}: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDirectionStyles = () => {
    switch (direction) {
      case 'up':
        return { container: 'flex-col-reverse bottom-full mb-2', item: '-translate-y-2' };
      case 'down':
        return { container: 'flex-col top-full mt-2', item: 'translate-y-2' };
      case 'left':
        return { container: 'flex-row-reverse right-full mr-2', item: '-translate-x-2' };
      case 'right':
        return { container: 'flex-row left-full ml-2', item: 'translate-x-2' };
    }
  };

  const dirStyles = getDirectionStyles();

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Actions */}
      <div
        className={`
          absolute ${dirStyles.container} gap-2
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          transition-opacity duration-200
        `}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            disabled={action.disabled}
            className={`
              w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700
              flex items-center justify-center shadow-lg
              transition-all duration-200
              ${isOpen ? 'translate-x-0 translate-y-0' : dirStyles.item}
              disabled:opacity-50
            `}
            style={{ transitionDelay: `${index * 30}ms` }}
            title={action.label}
          >
            <span className={action.color || 'text-white'}>
              {action.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600
          flex items-center justify-center text-white shadow-lg
          transition-transform duration-200
          ${isOpen ? 'rotate-45' : ''}
        `}
      >
        {icon || <PlusIcon />}
      </button>
    </div>
  );
}

// Pre-configured NFT actions
export function NFTQuickActions() {
  const defaultActions: QuickAction[] = [
    {
      id: 'mint',
      label: 'Mint NFT',
      icon: <MintIcon />,
      onClick: () => console.log('Mint NFT'),
      color: 'text-green-400',
    },
    {
      id: 'create',
      label: 'Create Collection',
      icon: <CreateIcon />,
      onClick: () => console.log('Create Collection'),
      color: 'text-purple-400',
    },
    {
      id: 'list',
      label: 'List for Sale',
      icon: <ListIcon />,
      onClick: () => console.log('List NFT'),
      color: 'text-blue-400',
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: <SendIcon />,
      onClick: () => console.log('Transfer NFT'),
      color: 'text-orange-400',
    },
  ];

  return <FloatingActionButton actions={defaultActions} />;
}

export default FloatingActionButton;
