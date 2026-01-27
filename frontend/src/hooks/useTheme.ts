'use client';

/**
 * useTheme Hook
 * Theme and appearance management
 * @module hooks/useTheme
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'red';

export interface ThemeSettings {
  mode: ThemeMode;
  accentColor: AccentColor;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

const defaultSettings: ThemeSettings = {
  mode: 'dark',
  accentColor: 'purple',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
};

// Accent color values
const accentColors: Record<AccentColor, { primary: string; secondary: string }> = {
  purple: { primary: '#8b5cf6', secondary: '#a78bfa' },
  blue: { primary: '#3b82f6', secondary: '#60a5fa' },
  green: { primary: '#22c55e', secondary: '#4ade80' },
  pink: { primary: '#ec4899', secondary: '#f472b6' },
  orange: { primary: '#f97316', secondary: '#fb923c' },
  red: { primary: '#ef4444', secondary: '#f87171' },
};

// Font size values
const fontSizes: Record<ThemeSettings['fontSize'], string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

// Storage key
const STORAGE_KEY = 'stacksmint-theme-settings';

/**
 * Hook for basic theme mode
 */
export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('dark');

  // Get system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (stored) {
      setMode(stored);
    }
  }, []);

  // Resolve system mode
  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedMode(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        setResolvedMode(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedMode(mode);
    }
  }, [mode]);

  // Apply mode to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedMode);
  }, [resolvedMode]);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  }, []);

  return {
    mode,
    resolvedMode,
    setMode: setThemeMode,
    isDark: resolvedMode === 'dark',
    isLight: resolvedMode === 'light',
    toggle: () => setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark'),
  };
}

/**
 * Hook for full theme settings
 */
export function useThemeSettings() {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch {
      // Use defaults
    }
    setIsLoaded(true);
  }, []);

  // Apply settings to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // Apply accent color
    const colors = accentColors[settings.accentColor];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.secondary);

    // Apply font size
    root.style.setProperty('--font-size-base', fontSizes[settings.fontSize]);

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updates: Partial<ThemeSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
    accentColors,
  };
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * Hook for high contrast preference
 */
export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

// Theme context for app-wide access
interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  isDark: boolean;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, resetSettings, isLoaded } = useThemeSettings();
  const { resolvedMode, toggle } = useThemeMode();

  // Sync mode from settings
  useEffect(() => {
    if (isLoaded) {
      updateSettings({ mode: settings.mode });
    }
  }, [isLoaded]);

  const value: ThemeContextType = {
    settings,
    updateSettings,
    resetSettings,
    isDark: resolvedMode === 'dark',
    toggleMode: toggle,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default useThemeMode;
