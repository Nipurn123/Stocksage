'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/utils/validation';
import { useSignUp, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { FcGoogle } from 'react-icons/fc';

type RegisterFormValues = {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, setActive } = useSignUp();
  
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
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      businessName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      if (!signUp) throw new Error('Sign up not available');
      
      // Clear sign-out flag since the user is explicitly trying to sign up
      localStorage.removeItem('user_signed_out');
      
      // Start the sign-up process with email and password
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      
      // Add the user's name
      await signUp.update({
        firstName: data.fullName,
        unsafeMetadata: {
          businessName: data.businessName,
        },
      });
      
      if (result.status === 'complete') {
        // Sign-up is complete, set the new session as active
        await setActive({ session: result.createdSessionId });
        toast.success('Account created successfully!');
        router.push('/dashboard');
      } else {
        // Email verification may be required
        toast.success('Please check your email to complete registration.');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (strategy: "oauth_google") => {
    setIsSocialLoading(true);
    
    try {
      if (!signUp) throw new Error('Sign up not available');
      
      // Clear sign-out flag since the user is explicitly trying to sign up with social
      localStorage.removeItem('user_signed_out');
      
      try {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: '/auth/sso-callback',
          redirectUrlComplete: '/dashboard',
        });
      } catch (socialError: any) {
        // Check for single session mode error
        if (socialError.message && socialError.message.includes('single session mode')) {
          toast.error('You need to completely sign out first.');
          // Redirect to our logout API
          window.location.href = `/api/auth/logout?redirect_url=${encodeURIComponent('/auth/register')}`;
          return;
        }
        throw socialError;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during social sign-up');
      console.error('Social sign-up error:', error);
      setIsSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join StockSage to manage your inventory and finances
          </p>
        </div>

        {/* Social Sign Up Buttons */}
        <div className="space-y-3">
          <Button 
            type="button" 
            variant="outline" 
            fullWidth 
            className="flex items-center justify-center"
            onClick={() => handleSocialSignUp("oauth_google")}
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
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              id="fullName"
              type="text"
              autoComplete="name"
              fullWidth
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Business Name"
              id="businessName"
              type="text"
              autoComplete="organization"
              fullWidth
              error={errors.businessName?.message}
              {...register('businessName')}
            />

            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              fullWidth
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              fullWidth
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <div>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Account
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 