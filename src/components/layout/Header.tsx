'use client';

import React, { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Bell, Settings, LogOut, HelpCircle, User, ChevronDown } from 'lucide-react';
import { logoutAndRedirect } from '@/utils/auth-helpers';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
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
    <header className="flex-1 flex justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Header title or logo could go here */}
      <div className="flex-1"></div>
      
      {/* Right side actions */}
      <div className="flex items-center pr-4">
        {/* Theme Toggle */}
        <div className="ml-4">
          <ThemeToggle />
        </div>
        
        {/* Notifications */}
        <button
          type="button"
          className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 relative"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
        </button>
        
        {/* Profile dropdown */}
        <div className="ml-4 relative">
          <button
            type="button"
            id="profile-menu-button"
            className="flex items-center gap-2 max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            onClick={toggleProfileMenu}
          >
            <span className="sr-only">Open user menu</span>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white shadow-md ${isGuest ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-indigo-600 to-indigo-700'}`}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-700 dark:text-white">{user?.firstName || 'User'}</p>
                {isGuest && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    Guest
                  </span>
                )}
                <ChevronDown className="h-4 w-4 ml-1 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </button>

          {/* Dropdown menu */}
          {profileMenuOpen && (
            <div
              id="profile-dropdown"
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700"
            >
              <div className="px-4 py-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  Signed in as
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.emailAddresses[0]?.emailAddress || 'user@example.com'}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Settings
                </Link>
                <Link
                  href="/help"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HelpCircle className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Help Center
                </Link>
              </div>
              <div className="py-1">
                <button
                  onClick={() => logoutAndRedirect('/')}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 