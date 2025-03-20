'use client';

import React, { useEffect, useState } from 'react';
import { clearClerkData } from '@/utils/auth-helpers';
import Button from './ui/Button';

interface ClerkErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * A component that detects and handles Clerk authentication errors
 */
const ClerkErrorBoundary: React.FC<ClerkErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for Clerk error messages in console logs
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const errorString = args.join(' ');
      
      // Check for specific Clerk error messages
      if (
        (typeof errorString === 'string' &&
          (errorString.includes('Unable to authenticate this browser') || 
           errorString.includes('Check your Clerk cookies') ||
           errorString.includes('clerk') && errorString.includes('authentication')))
      ) {
        setHasError(true);
        setErrorMessage('Authentication issue detected. Please try clearing your browser data.');
      }
      
      // Call the original console.error
      originalConsoleError.apply(console, args);
    };

    // Add a MutationObserver to detect Clerk error messages in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const errorElements = document.querySelectorAll('[role="alert"], .error, .clerk-error');
          errorElements.forEach((el) => {
            const text = el.textContent || '';
            if (
              text.includes('Unable to authenticate this browser') ||
              text.includes('Check your Clerk cookies') ||
              (text.includes('clerk') && text.includes('authentication'))
            ) {
              setHasError(true);
              setErrorMessage(text);
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Check for existing error messages
    const errorElements = document.querySelectorAll('[role="alert"], .error, .clerk-error');
    errorElements.forEach((el) => {
      const text = el.textContent || '';
      if (
        text.includes('Unable to authenticate this browser') ||
        text.includes('Check your Clerk cookies') ||
        (text.includes('clerk') && text.includes('authentication'))
      ) {
        setHasError(true);
        setErrorMessage(text);
      }
    });

    // Check URL for error parameter
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('clerkError');
    if (errorParam) {
      setHasError(true);
      setErrorMessage(decodeURIComponent(errorParam));
    }

    return () => {
      console.error = originalConsoleError;
      observer.disconnect();
    };
  }, []);

  const handleClearData = () => {
    clearClerkData();
    setHasError(false);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Authentication Error
          </h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {errorMessage || 
              "Unable to authenticate this browser for your Clerk development instance. This is likely due to cookie or local storage issues."}
          </p>
          <div className="flex flex-col space-y-3">
            <Button onClick={handleClearData} variant="danger">
              Clear Authentication Data & Reload
            </Button>
            <Button 
              onClick={() => window.location.href = '/api/auth/logout?redirect_url=/auth/login'} 
              variant="outline"
            >
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClerkErrorBoundary; 