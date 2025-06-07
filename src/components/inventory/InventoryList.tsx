'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Search, Filter, Edit, Trash2, Plus, AlertCircle, FileText } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import FilterDropdown from '@/components/ui/FilterDropdown';
import ProductQuickEdit from './ProductQuickEdit';
import { formatCurrency } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currentStock?: number;
  stockLevel?: number;  // For compatibility with older code
  minStockLevel?: number;
  reorderLevel?: number; // For compatibility with older code
  category: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryListProps {
  initialProducts?: Product[];
  batchOperationsEnabled?: boolean;
  onProductsUpdated?: () => void;
  refreshTrigger?: boolean;
  onRefreshComplete?: () => void;
  onProductsLoaded?: (products: Product[]) => void;
}

export default function InventoryList({ 
  initialProducts = [],
  batchOperationsEnabled = false,
  onProductsUpdated,
  refreshTrigger = false,
  onRefreshComplete,
  onProductsLoaded
}: InventoryListProps) {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // Initialize state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add missing properties to initial product data for compatibility
  const initialProductsWithDefaults = initialProducts.map(product => ({
    ...product,
    userId: product.userId || user?.id || 'unknown',
    currentStock: product.currentStock !== undefined ? product.currentStock : product.stockLevel,
    minStockLevel: product.minStockLevel !== undefined ? product.minStockLevel : product.reorderLevel,
  }));
  const [products, setProducts] = useState<Product[]>(initialProductsWithDefaults);
  const [filters, setFilters] = useState({
    category: [] as string[],
    stockStatus: [] as string[],
    priceRange: {
      min: null as number | null,
      max: null as number | null,
    },
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);

  // Handle refresh trigger from parent component
  useEffect(() => {
    if (refreshTrigger) {
      fetchProducts();
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    }
  }, [refreshTrigger]);

  // Function to fetch products from the API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!isSignedIn) {
        router.push('/auth/login?redirect=/inventory');
        return;
      }

      // Get auth token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/inventory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        router.push('/auth/login?redirect=/inventory');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Add missing properties to product data for compatibility
        const productsWithDefaults = result.data.map((product: Product) => ({
          ...product,
          userId: product.userId || user?.id || 'unknown',
          currentStock: product.currentStock !== undefined ? product.currentStock : product.stockLevel,
          minStockLevel: product.minStockLevel !== undefined ? product.minStockLevel : product.reorderLevel,
        }));

        setProducts(productsWithDefaults);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(result.pagination?.total || result.data?.length || 0 / prev.itemsPerPage),
        }));
        
        // Notify parent component about loaded products
        if (onProductsLoaded) {
          onProductsLoaded(productsWithDefaults);
        }
        
        // If batch operations is enabled, notify parent that products were updated
        if (batchOperationsEnabled && onProductsUpdated) {
          onProductsUpdated();
        }
      } else {
        throw new Error(result.error || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Count active filters
  const activeFilterCount = 
    filters.category.length + 
    filters.stockStatus.length + 
    (filters.priceRange.min !== null || filters.priceRange.max !== null ? 1 : 0) + 
    (filters.dateRange.from !== null || filters.dateRange.to !== null ? 1 : 0);

  // Fetch products
  useEffect(() => {
    if (initialProducts.length > 0) return;
    
    fetchProducts();
  }, [initialProducts.length, isSignedIn, getToken, router, user?.id]);
  
  // Filter and search products
  const filteredProducts = products.filter(product => {
    // Search filter
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false;
    }

    // Stock status filter
    if (filters.stockStatus.length > 0) {
      const stockLevel = getStockLevel(product);
      const minStockLevel = getMinStockLevel(product);
      
      const isOutOfStock = stockLevel === 0;
      const isLowStock = stockLevel > 0 && stockLevel <= minStockLevel;
      const isInStock = stockLevel > minStockLevel;

      const statusMatch = (
        (filters.stockStatus.includes('out-of-stock') && isOutOfStock) ||
        (filters.stockStatus.includes('low-stock') && isLowStock) ||
        (filters.stockStatus.includes('in-stock') && isInStock)
      );

      if (!statusMatch) return false;
    }

    // Price range filter
    if (filters.priceRange.min !== null && product.price < filters.priceRange.min) {
      return false;
    }
    if (filters.priceRange.max !== null && product.price > filters.priceRange.max) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.from !== null) {
      const productDate = new Date(product.createdAt);
      if (productDate < filters.dateRange.from) {
        return false;
      }
    }
    if (filters.dateRange.to !== null) {
      const productDate = new Date(product.createdAt);
      if (productDate > filters.dateRange.to) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
    }));
  };
  
  const handleEdit = (id: string) => {
    router.push(`/inventory/${id}/edit`);
  };
  
  const handleQuickEdit = (product: Product) => {
    // Check if user is authenticated before opening edit modal
    if (!isSignedIn) {
      router.push('/auth/login?redirect=/inventory');
      return;
    }
    
    // For quick edit, open the modal with the selected product
    setQuickEditProduct(product);
  };
  
  const handleQuickEditClose = () => {
    setQuickEditProduct(null);
  };
  
  const handleQuickEditSuccess = () => {
    setNotification({
      type: 'success',
      message: 'Product successfully updated',
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
    
    setQuickEditProduct(null);
    
    if (isSignedIn) {
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isSignedIn) {
        router.push('/auth/login?redirect=/inventory');
        return;
      }

      // Get auth token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push('/auth/login?redirect=/inventory');
        return;
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete product');
      }

      // Update products list by filtering out the deleted product
      setProducts(products.filter(product => product.id !== id));
      
      // Show success message
      setNotification({
        type: 'success',
        message: 'Product successfully deleted',
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product. Please try again.');
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete product',
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const tableColumn = ["Product", "SKU", "Price", "Stock", "Category", "Status"];
      
      // Map the products to the format needed for the PDF
      const tableRows = filteredProducts.map(product => {
        const stockLevel = getStockLevel(product);
        const minLevel = getMinStockLevel(product);
        
        let status = "In Stock";
        if (stockLevel === 0) {
          status = "Out of Stock";
        } else if (stockLevel <= minLevel) {
          status = "Low Stock";
        }
        
        return [
          product.name,
          product.sku,
          formatCurrency(product.price),
          stockLevel.toString(),
          product.category,
          status
        ];
      });
      
      // Add company info and title
      doc.setFontSize(20);
      doc.text("Inventory Report", 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add total count
      doc.text(`Total Products: ${filteredProducts.length}`, 14, 36);
      
      // Use the imported autoTable function instead
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Save the PDF
      doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Inventory report successfully exported',
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to export inventory report',
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Helper function to get stock level with proper fallbacks
  const getStockLevel = (product: Product): number => {
    return product.currentStock !== undefined ? product.currentStock : (product.stockLevel || 0);
  };

  // Helper function to get min stock level with proper fallbacks
  const getMinStockLevel = (product: Product): number => {
    return product.minStockLevel !== undefined ? product.minStockLevel : (product.reorderLevel || 5);
  };

  const getStockStatusBadge = (product: Product) => {
    const stockLevel = getStockLevel(product);
    const minLevel = getMinStockLevel(product);
    
    if (stockLevel === 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    }
    if (stockLevel <= minLevel) {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

  // Notify parent when products change if needed
  useEffect(() => {
    if (batchOperationsEnabled && onProductsUpdated) {
      onProductsUpdated();
    }
  }, [products, batchOperationsEnabled]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading inventory...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-center">
        <AlertCircle className="text-red-500 mb-2" size={24} />
        <p>{error}</p>
        <Button 
          variant="default" 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notification && (
        <div className={`p-4 rounded-md mb-4 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by fabric name or code..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="primary" className="ml-1 px-2 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {filterOpen && (
              <FilterDropdown
                filters={filters}
                setFilters={setFilters}
                onClose={() => setFilterOpen(false)}
                categories={Array.from(new Set(products.map(p => p.category)))}
              />
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={exportToPDF}
            className="flex items-center gap-2"
            disabled={filteredProducts.length === 0}
          >
            <FileText size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50 dark:bg-gray-900/50">
          <p className="text-gray-500 dark:text-gray-400">No products found.</p>
          {searchQuery || activeFilterCount > 0 ? (
            <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
              Try adjusting your search or filters.
            </p>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your products should load automatically. If you don't see any data, please try refreshing the page.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>SKU</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Stock</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <button 
                        onClick={() => router.push(`/inventory/${product.id}`)} 
                        className="hover:underline text-left focus:outline-none"
                      >
                        {product.name}
                      </button>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{getStockLevel(product)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{getStockStatusBadge(product)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product.id)}
                        >
                          <Edit size={16} />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length > pagination.itemsPerPage && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={Math.ceil(filteredProducts.length / pagination.itemsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
      
      {/* Quick Edit Modal */}
      {quickEditProduct && (
        <ProductQuickEdit
          productId={quickEditProduct.id}
          initialData={{
            name: quickEditProduct.name,
            sku: quickEditProduct.sku,
            price: quickEditProduct.price,
            currentStock: getStockLevel(quickEditProduct),
            minStockLevel: getMinStockLevel(quickEditProduct),
            category: quickEditProduct.category,
          }}
          onClose={handleQuickEditClose}
          onSuccess={handleQuickEditSuccess}
        />
      )}
    </div>
  );
} 