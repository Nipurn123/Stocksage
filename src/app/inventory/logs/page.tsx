'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { 
  Card, 
  Button, 
  Input,
  Select,
  Label,
  Pagination
} from '@/components/ui';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/Table';
import { 
  Search, 
  ArrowUpDown, 
  FileDown, 
  ArrowDown,
  ArrowUp,
  PackagePlus,
  PackageMinus,
  AlertCircle
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui';
import { format } from 'date-fns';
import { InventoryLog } from '@/types';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Sample data for demonstration - will only be used if API fails
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
  // Keep other sample logs
];

export default function InventoryLogsPage() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  
  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if user is authenticated
        if (!isSignedIn) {
          router.push('/auth/login?redirect=/inventory/logs');
          return;
        }
        
        // Get auth token from Clerk
        const token = await getToken();
        
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        // Build query string for filters
        let url = '/api/inventory/logs';
        const queryParams = new URLSearchParams();
        
        if (logType && logType !== 'all') {
          queryParams.append('type', logType);
        }
        
        if (dateRange?.from) {
          queryParams.append('startDate', dateRange.from.toISOString());
        }
        
        if (dateRange?.to) {
          queryParams.append('endDate', dateRange.to.toISOString());
        }
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.status === 401) {
          router.push('/auth/login?redirect=/inventory/logs');
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory logs: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.logs) {
          setLogs(result.logs);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Error fetching inventory logs:', error);
        
        // In development mode, fall back to sample data
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using sample data due to API fetch error');
          setLogs(SAMPLE_LOGS);
          setError('Using sample data - API fetch failed');
        } else {
          setError('Failed to load inventory logs. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [isSignedIn, getToken, router, logType, dateRange]);
  
  // Apply search filter
  useEffect(() => {
    if (!logs) return;
    
    let result = [...logs];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.product?.name?.toLowerCase().includes(term) || 
        log.product?.sku?.toLowerCase().includes(term) ||
        log.reference?.toLowerCase().includes(term) ||
        log.notes?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'quantity') {
        return sortDirection === 'asc' 
          ? a.quantity - b.quantity 
          : b.quantity - a.quantity;
      } else if (sortField === 'product') {
        const nameA = a.product?.name || '';
        const nameB = b.product?.name || '';
        return sortDirection === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      return 0;
    });
    
    setFilteredLogs(result);
    setCurrentPage(1);
  }, [logs, searchTerm, sortField, sortDirection]);
  
  // Handle sort clicks
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };
  
  // Export to PDF
  const exportToPDF = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const tableColumn = ["Product", "SKU", "Type", "Quantity", "Reference", "Date", "Notes"];
      
      // Map the logs to the format needed for the PDF
      const tableRows = filteredLogs.map(log => {
        return [
          log.product?.name || 'Unknown Product',
          log.product?.sku || '-',
          log.type === 'in' ? 'Stock In' : 'Stock Out',
          `${log.type === 'in' ? '+' : '-'}${Math.abs(log.quantityChange)}`,
          log.reference || '-',
          formatDate(log.createdAt),
          log.notes || '-'
        ];
      });
      
      // Add company info and title
      doc.setFontSize(20);
      doc.text("Inventory Movement Log", 14, 22);
      
      // Add date range if specified
      doc.setFontSize(10);
      if (dateRange?.from && dateRange?.to) {
        doc.text(`Period: ${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`, 14, 30);
      } else {
        doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, 14, 30);
      }
      
      // Add log type if filtered
      if (logType !== 'all') {
        doc.text(`Type: ${logType === 'in' ? 'Stock In' : 'Stock Out'}`, 14, 36);
      }
      
      // Add total count
      doc.text(`Total Records: ${filteredLogs.length}`, 14, logType !== 'all' ? 42 : 36);
      
      // Add the table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: logType !== 'all' ? 46 : 40,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Save the PDF
      doc.save(`inventory-logs-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export inventory logs to PDF');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };
  
  // Sort indicator component
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="mr-2" size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Filters */}
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
          
          <div>
            <Label htmlFor="log-type">Log Type</Label>
            <Select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date-range">Date Range</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={exportToPDF}
            className="flex items-center gap-2"
            disabled={filteredLogs.length === 0}
          >
            <FileDown className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </Card>

      <h2 className="text-xl font-semibold">Inventory Movement History</h2>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center p-12 border rounded-md bg-gray-50 dark:bg-gray-900/30">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No inventory logs found matching your criteria</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('product')} className="cursor-pointer">
                    <span className="flex items-center gap-1">
                      Product <SortIndicator field="product" />
                    </span>
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead onClick={() => handleSort('quantity')} className="cursor-pointer">
                    <span className="flex items-center gap-1">
                      Quantity <SortIndicator field="quantity" />
                    </span>
                  </TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                    <span className="flex items-center gap-1">
                      Date <SortIndicator field="createdAt" />
                    </span>
                  </TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <Link href={`/inventory/${log.productId}`} className="hover:underline">
                        {log.product?.name || 'Unknown Product'}
                      </Link>
                    </TableCell>
                    <TableCell>{log.product?.sku || '-'}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${
                        log.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.type === 'in' ? (
                          <PackagePlus size={16} className="text-green-600" />
                        ) : (
                          <PackageMinus size={16} className="text-red-600" />
                        )}
                        {log.type === 'in' ? 'Stock In' : 'Stock Out'}
                      </div>
                    </TableCell>
                    <TableCell className={log.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                      {log.type === 'in' ? '+' : '-'}{Math.abs(log.quantityChange)}
                    </TableCell>
                    <TableCell>{log.reference || '-'}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>{log.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
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
    </div>
  );
} 