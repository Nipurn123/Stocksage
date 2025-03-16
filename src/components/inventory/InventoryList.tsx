'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import FilterDropdown from '@/components/ui/FilterDropdown';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockLevel: number;
  minStockLevel: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  currentStock?: number;
  reorderLevel?: number;
}

interface InventoryListProps {
  initialProducts?: Product[];
}

export default function InventoryList({ initialProducts = [] }: InventoryListProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    category: string[];
    stockStatus: string[];
    priceRange: { min: number | null; max: number | null };
    dateRange: { from: Date | null; to: Date | null };
  }>({
    category: [],
    stockStatus: [],
    priceRange: { min: null, max: null },
    dateRange: { from: null, to: null },
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });

  // Count active filters
  const activeFilterCount = 
    filters.category.length + 
    filters.stockStatus.length + 
    (filters.priceRange.min !== null || filters.priceRange.max !== null ? 1 : 0) + 
    (filters.dateRange.from !== null || filters.dateRange.to !== null ? 1 : 0);

  // Fetch products
  useEffect(() => {
    if (initialProducts.length > 0) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/inventory');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setProducts(result.data);
          setPagination(prev => ({
            ...prev,
            totalPages: Math.ceil(result.pagination.total / prev.itemsPerPage),
          }));
        } else {
          throw new Error(result.error || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialProducts.length]);

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
      const isOutOfStock = product.stockLevel === 0;
      const isLowStock = product.stockLevel > 0 && product.stockLevel <= product.minStockLevel;
      const isInStock = product.stockLevel > product.minStockLevel;

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Update products list
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.stockLevel === undefined && product.currentStock !== undefined) {
      // Handle API response that uses currentStock instead of stockLevel
      if (product.currentStock === 0) {
        return <Badge variant="danger">Out of Stock</Badge>;
      }
      if (product.currentStock <= (product.reorderLevel || product.minStockLevel || 5)) {
        return <Badge variant="warning">Low Stock</Badge>;
      }
      return <Badge variant="success">In Stock</Badge>;
    }
    
    // Use stockLevel property
    if (product.stockLevel === 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    }
    if (product.stockLevel <= product.minStockLevel) {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

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
              <Button variant="primary" onClick={() => router.push('/inventory/add')}>
                Add your first product
              </Button>
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
                      <Link href={`/inventory/${product.id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stockLevel !== undefined ? product.stockLevel : product.currentStock}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{getStockStatusBadge(product)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/inventory/${product.id}`)}
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
    </div>
  );
} 