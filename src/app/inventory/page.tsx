'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, RefreshCcw, FileDown } from 'lucide-react';
import InventoryList from '@/components/inventory/InventoryList';
import Button from '@/components/ui/Button';

export default function InventoryPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WeaveMitra Inventory</h1>
          <p className="text-muted-foreground">
            Manage your textile products, track fabric stock, and monitor inventory changes.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" onClick={() => router.push('/inventory/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      <InventoryList />
    </div>
  );
} 