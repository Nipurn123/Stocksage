'use client';

import { useState, useEffect } from 'react';

/**
 * A component to test proper hydration patterns
 * - Server-side: renders a placeholder
 * - Client-side: renders dynamic content after hydration
 */
export default function HydrationTest() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="p-4 m-4 border rounded">
      <h3 className="text-lg font-semibold">Hydration Test Component</h3>
      <p>
        {isMounted 
          ? "✅ Client-side hydration complete" 
          : "⌛ Server-rendered content"}
      </p>
      {isMounted && (
        <div className="mt-2 text-sm">
          <p>Current time: {new Date().toLocaleTimeString()}</p>
          <p>This content only appears after hydration</p>
        </div>
      )}
    </div>
  );
} 