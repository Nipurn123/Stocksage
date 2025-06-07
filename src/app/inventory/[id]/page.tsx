'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { Card, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { 
  ArrowLeft, Edit, Trash2, Package, DollarSign, ShoppingCart, 
  ArrowUpRight, AlertTriangle, PlusCircle, MinusCircle 
} from 'lucide-react';
import Link from 'next/link';
import { Product, InventoryLog } from '@/types';
import StockAdjustmentForm from '@/components/inventory/StockAdjustmentForm';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const isGuest = user?.publicMetadata?.role === 'guest';
  
  const [product, setProduct] = useState<Product & { inventoryLogs?: InventoryLog[] }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Get auth token
        const token = await getToken();
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const response = await fetch(`/api/inventory/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch product details');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getToken]);

  const handleDeleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Get auth token
      const token = await getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete product');
      }

      // Show success message with toast or other notification (if component available)
      // Redirect back to inventory page
      router.push('/inventory');
      router.refresh();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Keep the page open and show the error message
      setIsLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <>
        <div className="page-heading">
          <h1 className="page-title">Product Details</h1>
          <Button variant="outline" asChild>
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Link>
          </Button>
        </div>

        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {error || 'Product not found'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <h1 className="page-title">{product.name}</h1>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/inventory/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {isGuest && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                You are currently in <strong>Guest Mode</strong>. Changes to inventory will not be saved.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 mr-2 text-gray-500" />
              <h2 className="text-xl font-semibold">Product Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-medium">{product.category || 'Uncategorized'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="mt-1">{product.description || 'No description available'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
              <h2 className="text-xl font-semibold">Pricing & Inventory</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className="text-xl font-semibold text-green-600">{formatCurrency(product.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cost</p>
                  <p className="text-xl font-semibold">{formatCurrency(product.cost || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</p>
                  <p className="font-medium">
                    {product.cost && product.cost > 0 
                      ? `${Math.round((product.price - product.cost) / product.price * 100)}%` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Profit per Unit</p>
                  <p className="font-medium">
                    {formatCurrency(product.price - (product.cost || 0))}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Stock</p>
                    <div className="flex items-center">
                      <p className="text-xl font-semibold">{product.currentStock}</p>
                      <div className="ml-2">
                        {product.currentStock === 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : product.currentStock <= (product.minStockLevel || 0) ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Stock Level</p>
                    <p className="text-xl font-semibold">{product.minStockLevel || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="inventory-logs">
          <TabsList>
            <TabsTrigger value="inventory-logs">Inventory Logs</TabsTrigger>
            <TabsTrigger value="stock-adjustment">Stock Adjustment</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory-logs">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Inventory Activity</h2>
                  <Button variant="outline" asChild size="sm">
                    <Link href={`/inventory/logs?productId=${id}`}>
                      View All Logs
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                {product.inventoryLogs && product.inventoryLogs.length > 0 ? (
                  <div className="space-y-4">
                    {product.inventoryLogs.map((log) => (
                      <div key={log.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            log.type === 'in' 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {log.type === 'in' ? (
                              <PlusCircle className={`h-5 w-5 text-green-600 dark:text-green-400`} />
                            ) : (
                              <MinusCircle className={`h-5 w-5 text-red-600 dark:text-red-400`} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">
                                {log.type === 'in' ? 'Added' : 'Removed'} {log.quantityChange} unit(s)
                              </p>
                              <p className="ml-2 text-sm text-gray-500">
                                ({log.reference})
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">{formatDate(log.createdAt)}</p>
                            {log.notes && (
                              <p className="text-sm mt-1">{log.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No inventory logs found for this product</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="stock-adjustment">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Adjust Stock Level</h2>
                <StockAdjustmentForm 
                  productId={product.id} 
                  currentStock={product.currentStock} 
                  onSuccess={() => {
                    // Refresh the product data
                    router.refresh();
                  }}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
} 