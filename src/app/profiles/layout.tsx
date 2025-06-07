'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useUser } from '@clerk/nextjs';

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-800" />
        {children}
      </div>
    </AppLayout>
  );
} 