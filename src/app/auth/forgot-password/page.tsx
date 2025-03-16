'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetRequestSchema } from '@/utils/validation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import axios from 'axios';

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // In a real application, this would call an API endpoint to send a password reset email
      // For demonstration purposes, we'll just simulate success and show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      
      toast.success('Password reset link sent to your email');
      setIsSubmitted(true);
    } catch (error) {
      toast.error('Failed to send password reset email. Please try again later.');
      console.error('Password reset request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Check Your Email</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>
          
          <div className="mt-6">
            <Button asChild fullWidth variant="outline">
              <Link href="/auth/login">
                Return to Login
              </Link>
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive an email?{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Forgot Your Password?</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              fullWidth
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Send Reset Link
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
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