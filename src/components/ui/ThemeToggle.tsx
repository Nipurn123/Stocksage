'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Simple toggle between light and dark, ignoring system
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Separate function to switch to system theme on long press or right click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setTheme('system');
  };

  return (
    <button
      onClick={toggleTheme}
      onContextMenu={handleContextMenu}
      className="relative inline-flex items-center justify-center p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 ease-in-out"
      aria-label={`Toggle theme, current theme is ${theme} (appears as ${resolvedTheme})`}
      title={`Click to toggle between light/dark mode. Right-click for system theme.`}
      data-theme-toggle
    >
      <span className="sr-only">
        Toggle theme, current theme is {theme}
      </span>
      
      <span className="relative">
        <Sun 
          className={`w-5 h-5 transition-all duration-300 ${
            resolvedTheme === 'dark' ? 'opacity-0 scale-0 absolute' : 'opacity-100 scale-100'
          }`} 
        />
        <Moon 
          className={`w-5 h-5 transition-all duration-300 ${
            resolvedTheme === 'light' ? 'opacity-0 scale-0 absolute' : 'opacity-100 scale-100'
          }`} 
        />
      </span>
      
      {theme === 'system' && (
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-400"></span>
      )}
    </button>
  );
} 