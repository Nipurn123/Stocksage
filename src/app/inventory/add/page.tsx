'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import AppLayout from '@/components/layout/AppLayout';
import ProductForm from '@/components/inventory/ProductForm';
import { Card, Button } from '@/components/ui';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      // Redirect to the inventory list or product details page
      router.push('/inventory');
      router.refresh();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-heading">
        <h1 className="page-title">Add New Product</h1>
        <Button variant="outline" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
        </Button>
      </div>

      {isGuest && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                You are currently in <strong>Guest Mode</strong>. The product will not be actually added to the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Card>
          <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Card>
      </div>
    </AppLayout>
  );
} 