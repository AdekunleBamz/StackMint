'use client';

/**
 * ThemeToggle Component
 * Theme switching and preferences
 * @module components/ThemeToggle
 * @version 1.0.0
 */

import { memo, useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

// Types
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Theme Provider
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'stacksmint-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
    setMounted(true);
  }, [storageKey]);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (!mounted) return;

    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);

    // Update document class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', resolved === 'dark' ? '#111827' : '#ffffff');
    }
  }, [theme, mounted, getSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setResolvedTheme(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, getSystemTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [storageKey]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme Toggle Button
interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function ThemeToggleComponent({
  variant = 'icon',
  size = 'md',
  className = '',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleToggle = () => {
    if (variant === 'dropdown') {
      setIsOpen(!isOpen);
    } else {
      // Simple toggle between light and dark
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
  };

  const SunIcon = () => (
    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const SystemIcon = () => (
    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gray-800/50 border border-gray-700
          text-gray-300 hover:text-white hover:border-gray-600
          transition-all
          ${className}
        `}
      >
        {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
        <span className="capitalize">{resolvedTheme}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={handleToggle}
          className={`
            ${sizeClasses[size]} rounded-lg
            text-gray-400 hover:text-white hover:bg-gray-800
            transition-colors
          `}
        >
          {theme === 'system' ? <SystemIcon /> : resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-36 py-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50">
              <button
                type="button"
                onClick={() => { setTheme('light'); setIsOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2
                  ${theme === 'light' ? 'text-purple-400' : 'text-gray-300 hover:bg-gray-800'}
                  transition-colors
                `}
              >
                <SunIcon />
                <span>Light</span>
                {theme === 'light' && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setTheme('dark'); setIsOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2
                  ${theme === 'dark' ? 'text-purple-400' : 'text-gray-300 hover:bg-gray-800'}
                  transition-colors
                `}
              >
                <MoonIcon />
                <span>Dark</span>
                {theme === 'dark' && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setTheme('system'); setIsOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2
                  ${theme === 'system' ? 'text-purple-400' : 'text-gray-300 hover:bg-gray-800'}
                  transition-colors
                `}
              >
                <SystemIcon />
                <span>System</span>
                {theme === 'system' && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Icon variant (default)
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]} rounded-lg
        text-gray-400 hover:text-white hover:bg-gray-800
        transition-colors
        ${className}
      `}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/**
 * ThemePicker - visual theme color picker
 */
interface ThemeColor {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

interface ThemePickerProps {
  colors: ThemeColor[];
  selected: string;
  onChange: (colorId: string) => void;
  className?: string;
}

export function ThemePicker({
  colors,
  selected,
  onChange,
  className = '',
}: ThemePickerProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {colors.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onChange(color.id)}
          title={color.name}
          className={`
            relative w-10 h-10 rounded-full overflow-hidden
            transition-transform hover:scale-110
            ${selected === color.id ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : ''}
          `}
        >
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${color.primary} 50%, ${color.secondary} 50%)` 
            }}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * AppearanceSettings - full appearance settings panel
 */
interface AppearanceSettingsProps {
  className?: string;
}

export function AppearanceSettings({ className = '' }: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('purple');
  const [reducedMotion, setReducedMotion] = useState(false);

  const accentColors: ThemeColor[] = [
    { id: 'purple', name: 'Purple', primary: '#9333EA', secondary: '#7C3AED' },
    { id: 'blue', name: 'Blue', primary: '#3B82F6', secondary: '#2563EB' },
    { id: 'green', name: 'Green', primary: '#10B981', secondary: '#059669' },
    { id: 'pink', name: 'Pink', primary: '#EC4899', secondary: '#DB2777' },
    { id: 'orange', name: 'Orange', primary: '#F97316', secondary: '#EA580C' },
    { id: 'red', name: 'Red', primary: '#EF4444', secondary: '#DC2626' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Theme */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Theme</h4>
        <div className="flex gap-3">
          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`
                flex-1 p-3 rounded-xl border text-center transition-all
                ${theme === t 
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                {t === 'light' && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                {t === 'dark' && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                {t === 'system' && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="text-sm capitalize">{t}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Accent Color</h4>
        <ThemePicker
          colors={accentColors}
          selected={accentColor}
          onChange={setAccentColor}
        />
      </div>

      {/* Reduced Motion */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">Reduced Motion</h4>
          <p className="text-sm text-gray-500">Minimize animations</p>
        </div>
        <button
          type="button"
          onClick={() => setReducedMotion(!reducedMotion)}
          className={`
            relative w-11 h-6 rounded-full transition-colors
            ${reducedMotion ? 'bg-purple-600' : 'bg-gray-700'}
          `}
        >
          <span
            className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
              ${reducedMotion ? 'left-5' : 'left-0.5'}
            `}
          />
        </button>
      </div>
    </div>
  );
}

export default memo(ThemeToggleComponent);
