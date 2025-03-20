'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function AuthErrorPage() {
  useEffect(() => {
    // Set a flag to indicate we've been to the error page
    sessionStorage.setItem('auth_error_visited', 'true');
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
    
    // Reload the page and redirect to login
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
          </div>
        </div>
      </div>
    </div>
  );
} 