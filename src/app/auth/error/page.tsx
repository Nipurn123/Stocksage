'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch(errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in using your original account method.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification link is invalid or has expired.';
      case 'SessionRequired':
        return 'You need to be signed in to access this page.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };
  
  const errorMessage = getErrorMessage(error);
  
  useEffect(() => {
    // Log the error for debugging purposes
    console.error('Auth error:', error);
  }, [error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/login">
              Return to Login
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              Go to Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <a
              href="mailto:support@stocksage.com"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 