'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function AuthErrorBoundary() {
  useEffect(() => {
    // Check if we're currently on the Clerk error page
    const checkForClerkErrorPage = () => {
      // Look for typical Clerk error page elements
      const errorTitle = document.querySelector('h1, h2');
      const isClerkErrorPage = 
        errorTitle?.textContent?.includes('Authentication Error') ||
        document.body.textContent?.includes('Authentication issue detected') ||
        document.body.textContent?.includes('Unable to authenticate this browser');
        
      // If we detect we're on the Clerk error page, inject our own UI or take over
      if (isClerkErrorPage) {
        // Try to hide the original error page
        const errorElements = document.querySelectorAll('div[role="alert"], .cl-rootBox');
        errorElements.forEach(el => {
          if (el.parentElement) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
    };
    
    // Run this check immediately and also after a short delay to ensure everything is loaded
    checkForClerkErrorPage();
    const timeoutId = setTimeout(checkForClerkErrorPage, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleClearData = () => {
    // Clear Clerk session data from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('clerk.') || key.startsWith('__clerk')) {
        localStorage.removeItem(key);
      }
    });

    // Clear session cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Reload the page
    window.location.reload();
  };

  const handleGoToLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Authentication issue detected. Please try clearing your browser data.
          </p>
          
          <div className="space-y-4">
            <Button 
              variant="danger" 
              fullWidth 
              onClick={handleClearData}
            >
              Clear Authentication Data & Reload
            </Button>
            
            <Button 
              variant="outline" 
              fullWidth 
              onClick={handleGoToLogin}
            >
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 