'use client';

import React, { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/lib/ThemeProvider';
import { Bell, Settings, LogOut, HelpCircle, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme } = useTheme();
  const isGuest = user?.publicMetadata.role === 'guest';
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#profile-menu-button') && !target.closest('#profile-dropdown')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="flex-1 flex justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Header title or logo could go here */}
      <div className="flex-1 flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors ml-2"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Right side actions */}
      <div className="flex items-center space-x-4 pr-4">
        {/* Theme indicator */}
        <div className="hidden md:flex items-center mr-2">
          <span className="text-sm text-muted-foreground mr-2">
            {theme === 'light' ? 'Light' : 'Dark'} Mode
          </span>
        </div>
        
        {/* Theme Toggle */}
        <div className="relative">
          <ThemeToggle />
        </div>
        
        {/* Notifications */}
        <button 
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 hover:dark:bg-gray-800 rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Profile menu button */}
        <div className="relative">
          <button
            id="profile-menu-button"
            className="flex items-center space-x-2 focus:outline-none"
            onClick={toggleProfileMenu}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 transition-colors">
              {user?.firstName?.[0] || user?.username?.[0] || <User className="w-5 h-5" />}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Guest User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                {isGuest ? 'Demo Account' : user?.primaryEmailAddress?.emailAddress || 'User'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors" />
          </button>
          
          {/* Profile dropdown */}
          {profileMenuOpen && (
            <div 
              id="profile-dropdown"
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 transition-colors"
            >
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 transition-colors">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Guest User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors">
                  {user?.primaryEmailAddress?.emailAddress || 'guest@example.com'}
                </p>
              </div>
              
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </div>
              </Link>
              
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </div>
              </Link>
              
              <Link href="/help" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </div>
              </Link>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button 
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 