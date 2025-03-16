'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { usePathname, useRouter } from 'next/navigation';
import { Package, List, Tags, BarChart } from 'lucide-react';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine the active tab based on the current path
  const getCurrentTab = () => {
    if (pathname.includes('/inventory/logs')) return 'logs';
    if (pathname.includes('/inventory/categories')) return 'categories';
    if (pathname.includes('/inventory/reports')) return 'reports';
    return 'products';
  };
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'products':
        router.push('/inventory');
        break;
      case 'logs':
        router.push('/inventory/logs');
        break;
      case 'categories':
        router.push('/inventory/categories');
        break;
      case 'reports':
        router.push('/inventory/reports');
        break;
    }
  };

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your product inventory</p>
        </div>
        
        <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {children}
      </div>
    </AppLayout>
  );
} 