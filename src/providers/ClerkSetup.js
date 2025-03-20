'use client';

/**
 * This file ensures Clerk has all necessary credentials
 * and provides fallback behavior when missing
 */

import { useEffect, useState } from 'react';

export function useClerkSetup() {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    // Check if Clerk credentials are properly set
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const hasCredentials = publishableKey && publishableKey.length > 10;
    
    if (!hasCredentials) {
      console.warn('Clerk credentials are missing. Authentication functions may not work properly.');
      setStatus('missing-credentials');
    } else {
      setStatus('ready');
    }
    
    // Add event listener for Clerk errors
    const handleClerkError = (event) => {
      if (
        event.message?.includes('Missing publishableKey') ||
        event.message?.includes('Missing secretKey') ||
        event.message?.includes('clerk')
      ) {
        console.error('Clerk authentication error:', event.message);
        setStatus('error');
      }
    };
    
    window.addEventListener('error', handleClerkError);
    
    return () => {
      window.removeEventListener('error', handleClerkError);
    };
  }, []);
  
  return status;
} 