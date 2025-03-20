'use client';

import { useEffect } from 'react';

/**
 * This component manages the hydration process
 * It runs only on the client side and ensures proper hydration state
 */
export default function HydrationManager() {
  useEffect(() => {
    // This runs only once after hydration is complete
    // Remove the hydration attribute to trigger CSS transitions
    const completeHydration = () => {
      if (document.documentElement.hasAttribute('data-hydrating')) {
        document.documentElement.removeAttribute('data-hydrating');
      }
    };
    
    // If the page is already loaded, complete hydration immediately
    if (document.readyState === 'complete') {
      // Small delay to ensure React has fully hydrated
      setTimeout(completeHydration, 100);
    } else {
      // Otherwise wait for the load event
      window.addEventListener('load', () => setTimeout(completeHydration, 100));
      
      // Cleanup function
      return () => {
        window.removeEventListener('load', completeHydration);
      };
    }
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 