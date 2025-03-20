'use client';

import React, { useEffect, useState, ReactNode } from 'react';

interface SafeHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that renders its children only after hydration is complete.
 * This helps prevent hydration mismatches for content that differs between server and client.
 * 
 * @example
 * <SafeHydration>
 *   <div>{new Date().toLocaleString()}</div>
 * </SafeHydration>
 */
export default function SafeHydration({ children, fallback = null }: SafeHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated once we're running on the client
    setIsHydrated(true);
  }, []);

  return (
    <>
      {/* Only render content that might cause hydration mismatches after hydration */}
      <div style={{ display: isHydrated ? 'block' : 'none' }} className="delayed-visibility">
        {children}
      </div>
      
      {/* Show a fallback during server rendering */}
      {!isHydrated && fallback}
    </>
  );
} 