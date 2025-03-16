'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input,
  Select,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination
} from '@/components/ui';
import { 
  Search, 
  ArrowUpDown, 
  FileDown, 
  Filter,
  ArrowDown,
  ArrowUp,
  PackagePlus,
  PackageMinus
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui';
import { format } from 'date-fns';
import { InventoryLog } from '@/types';
import Link from 'next/link';

// Sample data for demonstration
const SAMPLE_LOGS: InventoryLog[] = [
  {
    id: '1',
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'Cotton T-Shirt', 
      sku: 'CT001',
      price: 19.99,
      cost: 8.99,
      currentStock: 120,
      minStockLevel: 50,
      category: 'Clothing',
      description: 'Premium cotton t-shirt',
      userId: 'user-1',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    quantity: 120,
    quantityChange: 50,
    type: 'in',
    reference: 'PO-12345',
    notes: 'Restocking inventory',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'Cotton T-Shirt', 
      sku: 'CT001',
      price: 19.99,
      cost: 8.99,
      currentStock: 120,
      minStockLevel: 50,
      category: 'Clothing',
      description: 'Premium cotton t-shirt',
      userId: 'user-1',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    quantity: 115,
    quantityChange: -5,
    type: 'out',
    reference: 'Order #5678',
    notes: 'Customer order',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    productId: 'product-2',
    product: { 
      id: 'product-2',
      name: 'Denim Jeans', 
      sku: 'DJ002',
      price: 49.99,
      cost: 22.50,
      currentStock: 75,
      minStockLevel: 25,
      category: 'Clothing',
      description: 'Comfortable denim jeans',
      userId: 'user-1',
      createdAt: '2023-01-02',
      updatedAt: '2023-01-02'
    },
    quantity: 75,
    quantityChange: 25,
    type: 'in',
    reference: 'PO-23456',
    notes: 'Seasonal stock update',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'Wireless Headphones', 
      sku: 'WH003',
      price: 99.99,
      cost: 45.00,
      currentStock: 40,
      minStockLevel: 15,
      category: 'Electronics',
      description: 'Noise-cancelling wireless headphones',
      userId: 'user-1',
      createdAt: '2023-01-03',
      updatedAt: '2023-01-03'
    },
    quantity: 35,
    quantityChange: -5,
    type: 'out',
    invoiceId: 'invoice-2',
    reference: 'Order #9012',
    notes: 'Online order',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'Wireless Headphones', 
      sku: 'WH003',
      price: 99.99,
      cost: 45.00,
      currentStock: 40,
      minStockLevel: 15,
      category: 'Electronics',
      description: 'Noise-cancelling wireless headphones',
      userId: 'user-1',
      createdAt: '2023-01-03',
      updatedAt: '2023-01-03'
    },
    quantity: 40,
    quantityChange: -2,
    type: 'out',
    reference: 'ADJ-001',
    notes: 'Inventory adjustment - damaged item',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  }
];

export default function InventoryLogsPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const itemsPerPage = 10;
  
  // Fetch logs
  useEffect(() => {
    // Simulating API fetch with sample data
    const fetchLogs = async () => {
      try {
        // In a real scenario, this would be a fetch from your API
        // const response = await fetch('/api/inventory/logs');
        // const data = await response.json();
        // setLogs(data);
        
        // Using sample data for demonstration
        setLogs(SAMPLE_LOGS);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory logs:', error);
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...logs];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.product?.name.toLowerCase().includes(term) || 
        log.product?.sku.toLowerCase().includes(term) ||
        log.reference.toLowerCase().includes(term) ||
        log.notes?.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (logType !== 'all') {
      result = result.filter(log => log.type === logType);
    }
    
    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate >= fromDate && logDate <= toDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'productName':
          aValue = a.product?.name;
          bValue = b.product?.name;
          break;
        case 'quantity':
          aValue = a.quantityChange;
          bValue = b.quantityChange;
          break;
        default:
          aValue = a[sortField as keyof InventoryLog];
          bValue = b[sortField as keyof InventoryLog];
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredLogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, searchTerm, logType, dateRange, sortField, sortDirection]);
  
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  
  const handleSort = (field: string) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy HH:mm');
  };
  
  const exportToCSV = () => {
    // Implementation for exporting logs to CSV
    alert('Export functionality to be implemented');
  };
  
  // Sort indicator component
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Search by product, SKU, or reference"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/5">
            <Label htmlFor="log-type">Log Type</Label>
            <Select 
              id="log-type" 
              value={logType} 
              onChange={(e) => setLogType(e.target.value)}
            >
              <option value="all">All Logs</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <Label htmlFor="date-range">Date Range</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          
          <div className="w-full md:w-auto md:ml-auto flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setLogType('all');
                setDateRange(undefined);
              }}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Logs Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Inventory Activity Log</h3>
          <div className="text-sm text-gray-500">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'} found
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No inventory logs found matching your criteria
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('createdAt')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Date & Time
                        <SortIndicator field="createdAt" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('productName')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Product
                        <SortIndicator field="productName" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('type')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Type
                        <SortIndicator field="type" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('quantity')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Quantity
                        <SortIndicator field="quantity" />
                      </div>
                    </TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{log.product?.name}</div>
                        <div className="text-sm text-gray-500">SKU: {log.product?.sku}</div>
                      </TableCell>
                      <TableCell>
                        {log.type === 'in' ? (
                          <div className="flex items-center text-green-600 dark:text-green-500">
                            <PackagePlus className="h-4 w-4 mr-1" />
                            Stock In
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 dark:text-red-500">
                            <PackageMinus className="h-4 w-4 mr-1" />
                            Stock Out
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={log.type === 'in' ? 'text-green-600 dark:text-green-500 font-medium' : 'text-red-600 dark:text-red-500 font-medium'}>
                        {log.type === 'in' ? '+' : ''}{log.quantityChange}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.reference}</div>
                        {log.invoiceId && (
                          <div className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            <Link href={`/invoices/${log.invoiceId}`}>View Invoice</Link>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{log.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
} 