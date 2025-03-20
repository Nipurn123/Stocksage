'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Input, Select, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '@/components/ui';
import { Search, Plus, FileDown, Filter, ArrowDown, ArrowUp, ArrowUpDown, FileText, Clock, CheckCircle, AlertTriangle, RefreshCw, ScanLine, Pencil, DownloadCloud } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import type { Invoice } from '@/types/invoice';
import { FilterDropdown } from '@/components/invoices';
import { format } from 'date-fns';
import Link from 'next/link';
import { DateRangePicker } from '@/components/ui';

// Define a type for filters
interface InvoiceFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  amount?: {
    min: number;
    max: number;
  };
  vendors?: string[];
  customFields?: Record<string, string>;
}

// Extended invoice interface with source information
interface EnhancedInvoice extends Invoice {
  source: 'manual' | 'scan' | 'import' | 'system';
  lastUpdated?: string;
}

// Sample data for demonstration
const SAMPLE_INVOICES: EnhancedInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    date: '2023-05-15',
    dueDate: '2023-06-15',
    vendorName: 'Supplier Co.',
    vendorAddress: '123 Supplier St, City',
    customerName: 'Acme Corporation',
    customerAddress: '789 Acme Blvd, City',
    totalAmount: 1250.00,
    status: 'paid',
    items: [],
    createdAt: '2023-05-15T10:30:00Z',
    source: 'manual',
    lastUpdated: '2023-05-16T12:30:00Z'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    date: '2023-05-20',
    dueDate: '2023-06-20',
    vendorName: 'Vendor Inc.',
    vendorAddress: '456 Vendor Ave, City',
    customerName: 'Globex Industries',
    customerAddress: '101 Globex Rd, City',
    totalAmount: 3750.50,
    status: 'pending',
    items: [],
    createdAt: '2023-05-20T14:15:00Z',
    source: 'scan',
    lastUpdated: '2023-05-20T15:45:00Z'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2023-003',
    date: '2023-05-25',
    dueDate: '2023-06-25',
    vendorName: 'Supply Ltd.',
    vendorAddress: '789 Supply Ln, City',
    customerName: 'Stark Enterprises',
    customerAddress: '555 Stark Tower, City',
    totalAmount: 8200.75,
    status: 'overdue',
    items: [],
    createdAt: '2023-05-25T09:45:00Z',
    source: 'system',
    lastUpdated: '2023-05-25T10:15:00Z'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2023-004',
    date: '2023-06-01',
    dueDate: '2023-07-01',
    vendorName: 'Wholesale Co.',
    vendorAddress: '222 Wholesale Dr, City',
    customerName: 'Wayne Industries',
    customerAddress: '1 Wayne Manor, Gotham',
    totalAmount: 4500.00,
    status: 'paid',
    items: [],
    createdAt: '2023-06-01T11:20:00Z',
    source: 'import',
    lastUpdated: '2023-06-01T12:45:00Z'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2023-005',
    date: '2023-06-05',
    dueDate: '2023-07-05',
    vendorName: 'Parts Inc.',
    vendorAddress: '333 Parts Blvd, City',
    customerName: 'Oscorp',
    customerAddress: '42 Science Way, City',
    totalAmount: 2150.25,
    status: 'pending',
    items: [],
    createdAt: '2023-06-05T16:30:00Z',
    source: 'manual',
    lastUpdated: '2023-06-05T17:30:00Z'
  },
  {
    id: '6',
    invoiceNumber: 'INV-2023-006',
    date: '2023-06-10',
    dueDate: '2023-07-10',
    vendorName: 'Office Supplies Ltd.',
    vendorAddress: '444 Office Park, City',
    customerName: 'Dunder Mifflin',
    customerAddress: '1725 Slough Ave, Scranton',
    totalAmount: 850.75,
    status: 'paid',
    items: [],
    createdAt: '2023-06-10T13:45:00Z',
    source: 'scan',
    lastUpdated: '2023-06-10T14:30:00Z'
  },
  {
    id: '7',
    invoiceNumber: 'INV-2023-007',
    date: '2023-06-15',
    dueDate: '2023-07-15',
    vendorName: 'Tech Supplies',
    vendorAddress: '555 Tech Blvd, City',
    customerName: 'Pied Piper',
    customerAddress: '123 Silicon Valley',
    totalAmount: 5680.00,
    status: 'pending',
    items: [],
    createdAt: '2023-06-15T09:20:00Z',
    source: 'import',
    lastUpdated: '2023-06-15T10:45:00Z'
  },
  {
    id: '8',
    invoiceNumber: 'INV-2023-008',
    date: '2023-06-20',
    dueDate: '2023-07-05',
    vendorName: 'Global Shipping',
    vendorAddress: '777 Shipping Blvd, City',
    customerName: 'Hooli',
    customerAddress: '123 Silicon Valley',
    totalAmount: 3450.00,
    status: 'overdue',
    items: [],
    createdAt: '2023-06-20T10:15:00Z',
    source: 'scan',
    lastUpdated: '2023-06-20T11:45:00Z'
  },
  {
    id: '9',
    invoiceNumber: 'INV-2023-009',
    date: '2023-06-01',
    dueDate: '2023-06-15',
    vendorName: 'Tech Hardware Inc.',
    vendorAddress: '888 Hardware Ave, City',
    customerName: 'Initech',
    customerAddress: '456 Office Park, City',
    totalAmount: 1275.50,
    status: 'overdue',
    items: [],
    createdAt: '2023-06-01T14:30:00Z',
    source: 'manual',
    lastUpdated: '2023-06-01T15:45:00Z'
  }
];

export default function InvoicesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  
  const [invoices, setInvoices] = useState<EnhancedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<EnhancedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeFilters, setActiveFilters] = useState<InvoiceFilters>({});
  const [totalPages, setTotalPages] = useState(1);
  
  const itemsPerPage = 10;
  
  // Define fetchInvoices function before using it
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch invoices from the API with pagination and filters
      const url = new URL('/api/invoices', window.location.origin);
      
      // Add pagination parameters
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setInvoices(data.data);
        
        // Update total pages if available
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch invoices');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      toast.error('Failed to load invoices. Please try again.');
      // Fallback to sample data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using sample data as fallback');
        setInvoices(SAMPLE_INVOICES);
      }
      setLoading(false);
    }
  };
  
  // Fetch invoices
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, statusFilter]); // Fetch when page or status changes

  // Apply filters and search
  useEffect(() => {
    let result = [...invoices];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(term) || 
        invoice.customerName.toLowerCase().includes(term) ||
        invoice.vendorName.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(invoice => invoice.status === statusFilter);
    }
    
    // Apply source filter
    if (sourceFilter !== 'all') {
      result = result.filter(invoice => invoice.source === sourceFilter);
    }
    
    // Apply custom filters from FilterDropdown
    if (activeFilters.dateRange) {
      const fromDate = new Date(activeFilters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(activeFilters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= fromDate && invoiceDate <= toDate;
      });
    }
    
    if (activeFilters.amount) {
      const { min = 0, max = Infinity } = activeFilters.amount;
      result = result.filter(invoice => 
        invoice.totalAmount >= min && invoice.totalAmount <= max
      );
    }
    
    if (activeFilters.vendors && activeFilters.vendors.length > 0) {
      result = result.filter(invoice => 
        activeFilters.vendors!.some(vendor => 
          invoice.vendorName.toLowerCase().includes(vendor.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'source':
          aValue = a.source;
          bValue = b.source;
          break;
        case 'lastUpdated':
          aValue = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          bValue = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          break;
        default:
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredInvoices(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [invoices, searchTerm, statusFilter, sourceFilter, activeFilters, sortField, sortDirection]);
  
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle sort changes
  const handleSort = (field: string) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };
  
  // Format date values
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Export to CSV
  const exportToCSV = () => {
    // Implementation for exporting invoices to CSV
    toast.success('Exporting invoices to CSV...');
  };
  
  // Handle filter application
  const handleApplyFilters = (filters: InvoiceFilters) => {
    setActiveFilters(filters);
  };
  
  // Refresh data
  const handleRefresh = () => {
    toast.loading('Refreshing invoices...', { id: 'refresh-invoices' });
    fetchInvoices().then(() => {
      toast.success('Invoices refreshed!', { id: 'refresh-invoices' });
    }).catch((error: Error) => {
      toast.error('Failed to refresh invoices', { id: 'refresh-invoices' });
    });
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Sort indicator component
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="success" className="flex items-center">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive" className="flex items-center">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge>{status || 'Unknown'}</Badge>;
    }
  };
  
  // Source badge component
  const SourceBadge = ({ source }: { source: string }) => {
    switch (source) {
      case 'scan':
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <ScanLine className="h-3.5 w-3.5 mr-1" />
            Scanned
          </Badge>
        );
      case 'manual':
        return (
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Manual
          </Badge>
        );
      case 'import':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <DownloadCloud className="h-3.5 w-3.5 mr-1" />
            Imported
          </Badge>
        );
      case 'system':
        return (
          <Badge variant="secondary" className="bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            System
          </Badge>
        );
      default:
        return <Badge variant="secondary">{source}</Badge>;
    }
  };
  
  // Compute invoice stats
  const invoiceStats = {
    totalCount: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    byStatus: {
      paid: invoices.filter(inv => inv.status === 'paid').length,
      pending: invoices.filter(inv => inv.status === 'pending').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length
    },
    bySource: {
      scan: invoices.filter(inv => inv.source === 'scan').length,
      manual: invoices.filter(inv => inv.source === 'manual').length,
      import: invoices.filter(inv => inv.source === 'import').length,
      system: invoices.filter(inv => inv.source === 'system').length
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-4 dark:bg-blue-900/20 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <h3 className="text-2xl font-bold">{invoiceStats.totalCount}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full text-green-600 mr-4 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <h3 className="text-2xl font-bold">{formatCurrency(invoiceStats.totalAmount)}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 mr-4 dark:bg-yellow-900/20 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">{invoiceStats.byStatus.pending}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full text-red-600 mr-4 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <h3 className="text-2xl font-bold">{invoiceStats.byStatus.overdue}</h3>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Source Stats - Small badges showing counts by source */}
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <ScanLine className="h-3.5 w-3.5 mr-1" />
          Scanned: {invoiceStats.bySource.scan}
        </div>
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Manual: {invoiceStats.bySource.manual}
        </div>
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <DownloadCloud className="h-3.5 w-3.5 mr-1" />
          Imported: {invoiceStats.bySource.import}
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                placeholder="Search by invoice #, customer, or vendor"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              aria-label="Filter by status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="source">Source</Label>
            <select
              id="source"
              aria-label="Filter by source"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="scan">Scanned</option>
              <option value="manual">Manual</option>
              <option value="import">Imported</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="flex-shrink-0">
            <FilterDropdown onApplyFilters={handleApplyFilters} />
          </div>
          
          <div className="w-full md:w-auto md:ml-auto flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSourceFilter('all');
                setActiveFilters({});
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
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => router.push('/invoices/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
        <Button variant="outline" onClick={() => router.push('/invoices/scan')}>
          <ScanLine className="h-4 w-4 mr-2" />
          Scan Invoice
        </Button>
        <Button variant="outline" onClick={() => router.push('/invoices/manual')}>
          <Pencil className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>
      
      {/* Invoices Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">All Invoices</h3>
          <div className="text-sm text-gray-500">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'} found
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No invoices found matching your criteria
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('invoiceNumber')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Invoice #
                        <SortIndicator field="invoiceNumber" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('date')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Date
                        <SortIndicator field="date" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('customerName')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Customer
                        <SortIndicator field="customerName" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('totalAmount')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Amount
                        <SortIndicator field="totalAmount" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('dueDate')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Due Date
                        <SortIndicator field="dueDate" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('status')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Status
                        <SortIndicator field="status" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('source')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Source
                        <SortIndicator field="source" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/invoices/${invoice.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-sm text-gray-500">{invoice.vendorName}</div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status || 'pending'} />
                      </TableCell>
                      <TableCell>
                        <SourceBadge source={invoice.source} />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, invoices.length)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, invoices.length)}</span> of{' '}
                <span className="font-medium">{invoices.length}</span> results
              </p>
              <div className="flex space-x-1">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                {[...Array(totalPages || 1)].map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    size="sm"
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    disabled={loading}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === (totalPages || 1) || loading}
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      
      {isGuest && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Guest Mode Notice</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <p>
                  In guest mode, you can view sample invoices and try out features, but changes won't be saved. 
                  <br /> 
                  <a href="/auth/login" className="font-medium underline">Sign in</a> or <a href="/auth/register" className="font-medium underline">create an account</a> to save your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 