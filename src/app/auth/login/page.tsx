'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { Divider } from '@/components/ui/Divider';
import { FcGoogle } from 'react-icons/fc';

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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle both redirect_url and callbackUrl parameters
  const redirectUrl = searchParams.get('redirect_url') || searchParams.get('callbackUrl') || '/dashboard';
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  
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
      if (!signIn) throw new Error('Sign in not available');
      
      // Clear sign-out flag since the user is explicitly trying to sign in
      localStorage.removeItem('user_signed_out');
      
      // Start the first factor verification with email
      const firstFactor = await signIn.create({
        identifier: data.email,
        strategy: "email_code",
      });
      
      if (firstFactor.status === 'needs_first_factor') {
        // If the first factor is pending, we need to verify the code
        setIsEmailSent(true);
        toast.success('Verification code sent to your email');
      } else {
        throw new Error('Unexpected response from authentication service');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during sign in');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const onSubmitOtp = async (data: OtpFormValues) => {
    setIsLoading(true);
    
    try {
      if (!signIn) throw new Error('Sign in not available');
      
      // Attempt to complete the first factor verification with the code
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: data.code,
      });
      
      if (result.status === 'complete') {
        toast.success('Login successful!');
        
        // Use a small delay to ensure the session is properly created
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use window.location.href for redirection
        window.location.href = redirectUrl;
      } else {
        throw new Error('Verification failed. Please check your code and try again.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during verification');
      console.error('Verification error:', error);
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
    
    try {
      if (!signIn) throw new Error('Sign in not available');
      
      // Clear sign-out flag since the user is explicitly trying to sign in as guest
      localStorage.removeItem('user_signed_out');
      
      // First, create a guest user through our API
      const response = await fetch('/api/auth/guest-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create guest account');
      }
      
      const guestData = await response.json();
      
      if (!guestData.success) {
        throw new Error(guestData.error || 'Failed to create guest account');
      }
      
      try {
        // Sign in with the generated guest credentials
        const result = await signIn.create({
          identifier: guestData.email,
          password: guestData.password,
        });
        
        if (result.status === 'complete') {
          toast.success('Logged in as guest!');
          
          // Use a small delay to ensure the session is properly created
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Use window.location.href for redirection instead of router.push
          // This ensures a full page load and proper session establishment
          window.location.href = redirectUrl;
        } else {
          throw new Error('Guest login failed. Please try again.');
        }
      } catch (signInError: any) {
        console.error('Sign-in error:', signInError);
        
        // Handle specific Clerk errors
        if (signInError.message && (
          signInError.message.includes('single session mode') ||
          signInError.message.includes('Unable to authenticate this browser') ||
          signInError.message.includes('Check your Clerk cookies')
        )) {
          toast.error('Authentication error. Clearing data and trying again...');
          // Add an error parameter to the URL for the error boundary to pick up
          window.location.href = `/api/auth/logout?redirect_url=${encodeURIComponent('/auth/login?clerkError=' + encodeURIComponent('Authentication error. Please try again.'))}`;
          return;
        }
        
        // Rethrow other errors
        throw signInError;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during guest login');
      console.error('Guest login error:', error);
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleSocialSignIn = async (strategy: "oauth_google") => {
    setIsSocialLoading(true);
    
    try {
      if (!signIn) throw new Error('Sign in not available');
      
      // Clear sign-out flag since the user is explicitly trying to sign in with social
      localStorage.removeItem('user_signed_out');
      
      try {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: '/auth/sso-callback',
          redirectUrlComplete: redirectUrl,
        });
      } catch (socialError: any) {
        // Check for single session mode error
        if (socialError.message && socialError.message.includes('single session mode')) {
          toast.error('You need to completely sign out first.');
          // Redirect to our logout API
          window.location.href = `/api/auth/logout?redirect_url=${encodeURIComponent('/auth/login')}`;
          return;
        }
        throw socialError;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during social login');
      console.error('Social login error:', error);
      setIsSocialLoading(false);
    }
  };

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
                fullWidth 
                className="flex items-center justify-center"
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