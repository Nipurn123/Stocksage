'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * A component that ensures the user is authenticated.
 * Redirects to login if not signed in.
 * 
 * @example
 * <AuthRequired>
 *   <ProtectedPage />
 * </AuthRequired>
 */
export default function AuthRequired({
  children,
  fallback = null,
  redirectTo = '/auth/login'
}: AuthRequiredProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const currentPath = window.location.pathname;
      const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectPath);
    }
  }, [isLoaded, isSignedIn, redirectTo, router]);

  // Show fallback while loading or if not signed in
  if (!isLoaded || !isSignedIn) {
    return fallback;
  }

  return <>{children}</>;
} 