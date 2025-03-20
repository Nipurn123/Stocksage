'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import toast from 'react-hot-toast';

export default function SSOCallback() {
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Clear sign-out flag since the user is explicitly trying to sign in/up with SSO
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_signed_out');
        }
        
        // Get the redirect URL from the query params
        const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

        if (isSignInLoaded && signIn && searchParams.has('createdSessionId') && setActive) {
          // Handle sign-in flow
          const createdSessionId = searchParams.get('createdSessionId');
          
          if (createdSessionId) {
            await setActive({ session: createdSessionId });
            toast.success('Successfully signed in!');
            router.push(redirectUrl);
          }
        } else if (isSignUpLoaded && signUp && searchParams.has('createdSessionId') && setActive) {
          // Handle sign-up flow
          const createdSessionId = searchParams.get('createdSessionId');
          
          if (createdSessionId) {
            // For sign-up, we also use the setActive from signIn
            await setActive({ session: createdSessionId });
            toast.success('Successfully signed up!');
            router.push(redirectUrl);
          }
        } else {
          router.push('/auth/login?error=sso_callback_error');
        }
      } catch (error) {
        console.error('SSO callback error:', error);
        toast.error('An error occurred during sign-in. Please try again.');
        router.push('/auth/login?error=sso_callback_error');
      }
    };

    if (isSignInLoaded && isSignUpLoaded) {
      handleCallback();
    }
  }, [isSignInLoaded, isSignUpLoaded, signIn, signUp, searchParams, router, setActive]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Completing your sign-in...
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          You'll be redirected automatically.
        </p>
      </div>
    </div>
  );
} 