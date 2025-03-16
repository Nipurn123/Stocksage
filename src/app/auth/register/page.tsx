'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/utils/validation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import axios from 'axios';

type RegisterFormValues = {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
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
      const response = await axios.post('/api/auth/register', {
        name: data.fullName,
        businessName: data.businessName,
        email: data.email,
        password: data.password,
      });

      if (response.status === 201) {
        toast.success('Registration successful! Please sign in.');
        router.push('/auth/login');
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
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