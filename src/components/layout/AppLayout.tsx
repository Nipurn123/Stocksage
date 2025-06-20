'use client';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const isGuest = user?.publicMetadata.role === 'guest';

  // Add responsive handling with smarter breakpoints
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024;
      
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        
        // Auto-close sidebar on mobile resize
        if (newIsMobile && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, sidebarOpen]);

  // Handle animations
  useEffect(() => {
    if (sidebarOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when mobile menu is open
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleAnimationEnd = () => {
    if (!sidebarOpen) {
      setIsAnimating(false);
    }
  };

  // Show loading state while checking auth
  if (!userLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-indigo-600 dark:text-indigo-400">Loading StockSage...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn && typeof window !== 'undefined') {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {(isMobile && (sidebarOpen || isAnimating)) && (
        <div 
          className={`fixed inset-0 z-40 bg-gray-600 transition-opacity duration-300 ${
            sidebarOpen ? 'bg-opacity-75 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 flex flex-col z-50 lg:hidden w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onTransitionEnd={handleAnimationEnd}
      >
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <Sidebar 
          isMobile={true}
          onClose={() => setSidebarOpen(false)} 
        />
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Fixed Mobile menu button only - move Header out of routes with duplicate navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
          {/* Mobile menu button */}
          <button
            className="lg:hidden px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Header content */}
          <Header toggleSidebar={() => setSidebarOpen(true)} />
        </div>
        
        {/* Guest banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 border-b border-yellow-200 dark:border-yellow-900/50 px-4 py-3 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center max-w-7xl mx-auto gap-2">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <span className="font-medium">Guest Mode Active:</span> Some features may be limited. Data will not be saved.
              </p>
              <button 
                onClick={() => router.push('/auth/login')}
                className="text-xs font-medium text-yellow-800 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 underline"
              >
                Sign in with an account
              </button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} StockSage. All rights reserved.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link 
                  href="/privacy" 
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/help" 
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout; 