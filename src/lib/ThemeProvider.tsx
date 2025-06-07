'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { safelyApplyTheme, isClient } from './hydration-utils';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark'; // Actual applied theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document - only run on the client side after hydration
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (!isClient || !mounted) return;
    
    // Use the safe utility function to apply theme
    safelyApplyTheme(newTheme);
    setResolvedTheme(newTheme);
  };

  // Set theme with localStorage persistence
  const setTheme = (newTheme: Theme) => {
    if (!isClient || !mounted) return;
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
    setThemeState(newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Initial setup - runs once on component mount
  useEffect(() => {
    // Set mounted to true to indicate client-side rendering is complete
    setMounted(true);
  }, []);

  // Initialize theme from localStorage - only after mounted
  useEffect(() => {
    if (!mounted) return;

    // Get theme from localStorage or default to system
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Failed to get theme from localStorage:', error);
    }
    
    // Initial application of theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const initialTheme = localStorage.getItem('theme') as Theme | null;
    
    if (!initialTheme || initialTheme === 'system') {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      applyTheme(initialTheme as 'light' | 'dark');
    }
  }, [mounted]);

  // Watch for system theme changes using media query
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Add listener for system preference changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, theme]);

  // Apply theme effect when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
    } else {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  // Provide children with theme context
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      resolvedTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
} 