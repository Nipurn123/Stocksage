'use client';

import React, { useState, useEffect } from 'react';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';

interface ClerkErrorProviderProps {
  children: React.ReactNode;
}

export default function ClerkErrorProvider({ children }: ClerkErrorProviderProps) {
  const [hasAuthError, setHasAuthError] = useState(false);

  useEffect(() => {
    // Check if there's an authentication error
    const checkForAuthErrors = () => {
      // Look for specific error messages in the console
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const errorString = args.join(' ');
        if (
          errorString.includes('Unable to authenticate this browser') ||
          errorString.includes('Authentication issue detected') ||
          errorString.includes('Check your Clerk cookies') ||
          errorString.includes('Missing publishableKey')
        ) {
          setHasAuthError(true);
        }
        originalConsoleError.apply(console, args);
      };

      // Also check for Clerk error elements in the DOM
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const errorElements = document.querySelectorAll('div[role="alert"]');
            for (let i = 0; i < errorElements.length; i++) {
              const element = errorElements[i];
              if (
                element.textContent?.includes('Authentication Error') ||
                element.textContent?.includes('Unable to authenticate') ||
                element.textContent?.includes('Missing publishableKey')
              ) {
                setHasAuthError(true);
                break;
              }
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Check URL for auth error params
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('clerkError')) {
        setHasAuthError(true);
      }

      // Cleanup
      return () => {
        console.error = originalConsoleError;
        observer.disconnect();
      };
    };

    // Check if building/exporting statically in development/CI
    const isStaticExport = 
      process.env.NODE_ENV === 'production' && 
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === undefined;

    if (isStaticExport) {
      // Skip error checking during static builds
      return;
    }

    checkForAuthErrors();
  }, []);

  // Auto-detect the Clerk error screen
  useEffect(() => {
    const detectClerkErrorScreen = () => {
      // Look for elements that indicate the Clerk error UI is showing
      const errorTitle = document.querySelector('h1, h2, h3, h4, h5, h6');
      if (errorTitle && (
          errorTitle.textContent?.includes('Authentication Error') ||
          errorTitle.textContent?.includes('Missing publishableKey')
      )) {
        setHasAuthError(true);
      }

      // Check for browser data clearing button
      const clearButton = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Clear Authentication Data') || 
              btn.textContent?.includes('Clear Browser Data')
      );
      
      if (clearButton) {
        setHasAuthError(true);
      }
    };

    // Run detection after a short delay to allow DOM to render
    const timeoutId = setTimeout(detectClerkErrorScreen, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  if (hasAuthError) {
    return <AuthErrorBoundary />;
  }

  return <>{children}</>;
} 