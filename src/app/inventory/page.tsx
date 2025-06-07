'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, RefreshCcw, List, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import InventoryList from '@/components/inventory/InventoryList';
import BatchOperations from '@/components/inventory/BatchOperations';
import Button from '@/components/ui/Button';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currentStock?: number;
  minStockLevel?: number;
  category: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [showBatchOperations, setShowBatchOperations] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsNeedRefresh, setProductsNeedRefresh] = useState(false);

  const handleProductsUpdated = () => {
    setProductsNeedRefresh(true);
  };

  const handleProductsLoaded = (loadedProducts: Product[]) => {
    setProducts(loadedProducts);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WeaveMitra Inventory</h1>
          <p className="text-muted-foreground">
            Manage your textile products, track fabric stock, and monitor inventory changes.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowBatchOperations(!showBatchOperations)}
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-2" />
            Batch Operations
            {showBatchOperations ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => router.push('/inventory/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      <BatchOperations 
        products={products} 
        onProductsUpdated={handleProductsUpdated}
        visible={showBatchOperations}
      />
      
      <InventoryList 
        batchOperationsEnabled={showBatchOperations}
        onProductsUpdated={handleProductsUpdated}
        refreshTrigger={productsNeedRefresh}
        onRefreshComplete={() => setProductsNeedRefresh(false)}
        onProductsLoaded={handleProductsLoaded}
      />
    </div>
  );
} 