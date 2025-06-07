'use client';

import React from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-300">
      {/* Main content */}
      <main className="flex-1 relative">
        <div className="py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}