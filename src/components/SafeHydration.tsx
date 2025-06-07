'use client';

import React, { useEffect, useState, ReactNode } from 'react';

interface SafeHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional delay in milliseconds before showing content after hydration
   * Useful for preventing flash of content during transitions
   */
  delay?: number;
}

/**
 * A component that renders its children only after hydration is complete.
 * This helps prevent hydration mismatches for content that differs between server and client.
 * 
 * @example
 * <SafeHydration fallback={<span>Loading...</span>}>
 *   <div>{new Date().toLocaleString()}</div>
 * </SafeHydration>
 */
export default function SafeHydration({ children, fallback = null, delay = 0 }: SafeHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Mark as hydrated once we're running on the client
    setIsHydrated(true);

    // If there's a delay, wait before showing content
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [delay]);

  // Add transition classes for smooth content appearance
  const contentClass = shouldRender ? 'opacity-100 transition-opacity duration-200' : 'opacity-0';

  // Only render children after hydration and optional delay
  if (!isHydrated || !shouldRender) {
    return fallback;
  }

  return <div className={contentClass}>{children}</div>;
} 