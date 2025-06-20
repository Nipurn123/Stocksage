'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { FcGoogle } from 'react-icons/fc';
import SafeHydration from '@/components/SafeHydration';

// Schema for email-only first factor
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Schema for OTP verification
const otpSchema = z.object({
  code: z.string().min(6, 'Please enter the 6-digit code').max(6, 'Code must be 6 digits'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

// Loading component for Suspense
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Loading
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please wait...
        </p>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle all possible redirect parameter names
  const redirectUrl = 
    searchParams.get('redirect') || 
    searchParams.get('redirect_url') || 
    searchParams.get('callbackUrl') || 
    '/dashboard';
    
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  
  // Redirect if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.push(redirectUrl);
    }
  }, [isSignedIn, redirectUrl, router]);
  
  // Email form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // OTP form
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  // Handle authentication errors and redirects
  React.useEffect(() => {
    // Check if there was an authentication error in the URL
    const searchParams = new URLSearchParams(window.location.search);
    const clerkError = searchParams.get('clerkError');
    
    if (clerkError) {
      toast.error(decodeURIComponent(clerkError));
      
      // Remove the error from the URL to avoid showing it again on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('clerkError');
      window.history.replaceState({}, '', newUrl.toString());
    }
    
    // Check if user has explicitly signed out
    const hasSignedOut = localStorage.getItem('user_signed_out') === 'true';
    
    if (hasSignedOut) {
      // If user is still signed in, force a proper logout through our API
      if (isSignedIn) {
        window.location.href = `/api/auth/logout?redirect_url=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      
      // Clear Clerk session data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('clerk.') || key.startsWith('__clerk')) {
          localStorage.removeItem(key);
        }
      });

      // Clear session cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Remove the sign-out flag after clearing everything
      localStorage.removeItem('user_signed_out');
      
      // Force a page reload once to ensure clean state (only if we haven't already reloaded)
      const hasReloaded = sessionStorage.getItem('has_reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('has_reloaded', 'true');
        window.location.reload();
      } else {
        sessionStorage.removeItem('has_reloaded');
      }
    } else if (isSignedIn) {
      // Use window.location.href for redirection when already signed in
      window.location.href = redirectUrl;
    }
  }, [isSignedIn, redirectUrl]);
  
  // Step 1: Send email verification
  const onSubmitEmail = async (data: EmailFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await signIn?.create({
        identifier: data.email,
        strategy: 'email_code',
      });

      if (response?.status === 'complete') {
        // User authenticated, redirecting
        toast.success('Signed in successfully!');
        router.push(redirectUrl);
      } else {
        // Otherwise, we send a verification code to the email
        await signIn?.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: response?.createdSessionId || '',
        });
        
        toast.success('Verification code sent to your email');
        setVerificationId(response?.id || null);
        setIsEmailSent(true);
      }
    } catch (error: any) {
      console.error('Error during email login:', error);
      toast.error(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const onSubmitOtp = async (data: OtpFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await signIn?.attemptFirstFactor({
        strategy: 'email_code',
        code: data.code,
      });

      if (response?.status === 'complete') {
        // Verification successful, redirect
        toast.success('Signed in successfully!');
        router.push(redirectUrl);
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Error during OTP verification:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Allow the user to go back and change email
  const handleBackToEmail = () => {
    setIsEmailSent(false);
    setVerificationId(null);
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    setGuestError(null); // Clear previous errors
    
    try {
      // First, get a guest credential from our API
      const guestResponse = await fetch('/api/auth/guest-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!guestResponse.ok) {
        throw new Error('Failed to create guest session');
      }
      
      const guestData = await guestResponse.json();
      
      if (!guestData.success) {
        throw new Error(guestData.error || 'Failed to create guest session');
      }
      
      // Now sign in with the generated credentials
      const response = await signIn?.create({
        identifier: guestData.email,
        password: guestData.password,
      });

      if (response?.status === 'complete') {
        toast.success('Signed in as guest!');
        router.push(redirectUrl);
      } else {
        setGuestError('Guest login failed. Please try email login instead.');
        toast.error('Guest login failed. Please try email login.');
      }
    } catch (error: any) {
      console.error('Error during guest login:', error);
      setGuestError(error.message || 'Guest login failed. Please try email login.');
      toast.error(error.message || 'Guest login failed. Please try email login.');
    } finally {
      setIsGuestLoading(false);
    }
  };
  
  // Handle social sign-in
  const handleSocialSignIn = async (strategy: "oauth_google") => {
    setIsSocialLoading(true);
    
    try {
      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: `/auth/sso-callback?redirect=${encodeURIComponent(redirectUrl)}`,
        redirectUrlComplete: redirectUrl,
      });
    } catch (error: any) {
      console.error('Error during social login:', error);
      toast.error(error.message || 'Social login failed. Please try again.');
      setIsSocialLoading(false);
    }
  };

  // Wrap dynamic content that might cause hydration mismatch
  const renderRedirectUrl = () => (
    <SafeHydration fallback={<span>/dashboard</span>}>
      <span>{redirectUrl}</span>
    </SafeHydration>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome to StockSage</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isEmailSent ? 'Check your email for verification code' : 'Sign in to your account'}
          </p>
        </div>
        
        {!isEmailSent ? (
          <>
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={() => handleSocialSignIn("oauth_google")}
                isLoading={isSocialLoading}
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* Email Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmitEmail(onSubmitEmail)}>
              <div className="space-y-4">
                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  error={emailErrors.email?.message}
                  {...registerEmail('email')}
                />
              </div>

              <div>
                <Button type="submit" fullWidth isLoading={isLoading}>
                  Continue with Email
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* OTP Verification Form */
          <form className="mt-8 space-y-6" onSubmit={handleSubmitOtp(onSubmitOtp)}>
            <div className="space-y-4">
              <Input
                label="Verification Code"
                id="code"
                type="text"
                autoComplete="one-time-code"
                fullWidth
                error={otpErrors.code?.message}
                {...registerOtp('code')}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the 6-digit code sent to your email address
              </p>
            </div>

            <div className="space-y-3">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Verify
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                fullWidth
                onClick={handleBackToEmail}
              >
                Use a different email
              </Button>
            </div>
          </form>
        )}

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        <div>
          <Button 
            variant="secondary" 
            fullWidth 
            isLoading={isGuestLoading} 
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </Button>
          
          {guestError && (
            <div className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
              <p>{guestError}</p>
              <p className="text-xs mt-1">You might need to refresh the page and try again.</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
} 