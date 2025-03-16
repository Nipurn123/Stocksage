'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { usePathname, useRouter } from 'next/navigation';
import { Truck, Users, ShoppingCart, BarChart, Box } from 'lucide-react';

export default function SupplyChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine the active tab based on the current path
  const getCurrentTab = () => {
    if (pathname.includes('/supply-chain/suppliers')) return 'suppliers';
    if (pathname.includes('/supply-chain/orders')) return 'orders';
    if (pathname.includes('/supply-chain/shipments')) return 'shipments';
    if (pathname.includes('/supply-chain/analytics')) return 'analytics';
    return 'overview';
  };
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'overview':
        router.push('/supply-chain');
        break;
      case 'suppliers':
        router.push('/supply-chain/suppliers');
        break;
      case 'orders':
        router.push('/supply-chain/orders');
        break;
      case 'shipments':
        router.push('/supply-chain/shipments');
        break;
      case 'analytics':
        router.push('/supply-chain/analytics');
        break;
    }
  };

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Supply Chain Management</h1>
          <p className="text-muted-foreground">Track suppliers, manage orders, and optimize your procurement process</p>
        </div>
        
        <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Shipments</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {children}
      </div>
    </AppLayout>
  );
} 