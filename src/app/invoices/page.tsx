'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Input, Label } from '@/components/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Search, Plus, FileDown, ArrowDown, ArrowUp, ArrowUpDown, FileText, Clock, CheckCircle, AlertTriangle, RefreshCw, ScanLine, Pencil, DownloadCloud, Eye, Edit } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import type { Invoice } from '@/types/invoice';
import { FilterDropdown } from '@/components/invoices';
import { format } from 'date-fns';
import Link from 'next/link';

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
  const { user, isLoaded, isSignedIn } = useUser();
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
  const [retryCount, setRetryCount] = useState(0);
  
  const itemsPerPage = 10;
  
  // Define fetchInvoices function before using it
  const fetchInvoices = async () => {
    // Don't fetch if not signed in
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    
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
      
      // Add a cache-busting parameter to prevent caching issues
      url.searchParams.append('_t', Date.now().toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.id || 'guest-user'}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        // Increase timeout
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          // Redirect to login page if unauthorized
          router.push(`/auth/login?redirect=${encodeURIComponent('/invoices')}`);
          throw new Error('Please sign in to view invoices');
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setInvoices(data.data);
        
        // Update total pages if available
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
        
        // Reset retry count on success
        setRetryCount(0);
      } else {
        throw new Error(data.error || 'Failed to fetch invoices');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      
      // Don't show error for auth redirects
      if (err instanceof Error && err.message.includes('Please sign in')) {
        // Don't set error message since we're redirecting
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
        toast.error('Failed to load invoices. Please try again.');
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Fallback to sample data in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using sample data as fallback');
          setInvoices(SAMPLE_INVOICES);
        }
      }
      
      setLoading(false);
    }
  };
  
  // Add a redirect effect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/invoices')}`);
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch invoices with exponential backoff retry logic
  useEffect(() => {
    // Don't attempt to fetch if we're not signed in
    if (!isSignedIn) return;
    
    // Only fetch if signed in and we don't have data yet or if we're retrying
    if (isSignedIn && (!invoices.length || error)) {
      // If we've tried less than 3 times
      if (retryCount < 3) {
        const backoffTime = retryCount === 0 ? 0 : Math.pow(2, retryCount) * 1000;
        
        const timeoutId = setTimeout(() => {
          fetchInvoices();
        }, backoffTime);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isSignedIn, currentPage, statusFilter, retryCount]);
  
  // Handle manual retry
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchInvoices();
  };
  
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
      switch (sortField) {
        case 'date':
          return sortDirection === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'dueDate':
          return sortDirection === 'asc'
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'totalAmount':
          return sortDirection === 'asc' 
            ? a.totalAmount - b.totalAmount
            : b.totalAmount - a.totalAmount;
        case 'customerName':
          if (sortDirection === 'asc') {
            return a.customerName.localeCompare(b.customerName);
          } else {
            return b.customerName.localeCompare(a.customerName);
          }
        case 'status': {
          const aStatus = a.status || '';
          const bStatus = b.status || '';
          return sortDirection === 'asc'
            ? aStatus.localeCompare(bStatus)
            : bStatus.localeCompare(aStatus);
        }
        case 'source': {
          const aSource = a.source || '';
          const bSource = b.source || '';
          return sortDirection === 'asc'
            ? aSource.localeCompare(bSource)
            : bSource.localeCompare(aSource);
        }
        case 'lastUpdated': {
          const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        }
        default: {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        }
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
    }).catch(() => {
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
    if (sortField !== field) return (
      <ArrowUpDown className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 transition-colors duration-200" />
    );
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1.5 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1.5 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
    );
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'paid':
        return (
          <Badge 
            variant="success" 
            className="flex items-center px-2.5 py-1 rounded-full text-sm transition-colors duration-200 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800/50"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge 
            variant="warning" 
            className="flex items-center px-2.5 py-1 rounded-full text-sm transition-colors duration-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800/50"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge 
            variant="destructive" 
            className="flex items-center px-2.5 py-1 rounded-full text-sm transition-colors duration-200 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800/50"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge 
            className="flex items-center px-2.5 py-1 rounded-full text-sm transition-colors duration-200"
          >
            {status || 'Unknown'}
          </Badge>
        );
    }
  };
  
  // Source badge component
  const SourceBadge = ({ source }: { source: string }) => {
    switch (source) {
      case 'scan':
        return (
          <Badge 
            variant="secondary" 
            className="flex items-center px-2.5 py-1 rounded-full text-xs transition-colors duration-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50"
          >
            <ScanLine className="h-3.5 w-3.5 mr-1.5" />
            Scanned
          </Badge>
        );
      case 'manual':
        return (
          <Badge 
            variant="secondary" 
            className="flex items-center px-2.5 py-1 rounded-full text-xs transition-colors duration-200 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Manual
          </Badge>
        );
      case 'import':
        return (
          <Badge 
            variant="secondary" 
            className="flex items-center px-2.5 py-1 rounded-full text-xs transition-colors duration-200 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800/50"
          >
            <DownloadCloud className="h-3.5 w-3.5 mr-1.5" />
            Imported
          </Badge>
        );
      case 'system':
        return (
          <Badge 
            variant="secondary" 
            className="flex items-center px-2.5 py-1 rounded-full text-xs transition-colors duration-200 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            System
          </Badge>
        );
      default:
        return (
          <Badge 
            variant="secondary" 
            className="flex items-center px-2.5 py-1 rounded-full text-xs transition-colors duration-200"
          >
            {source}
          </Badge>
        );
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
  
  const handleViewSampleInvoice = (type = 'standard') => {
    fetch(`/api/invoices/sample?type=${type}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          router.push(`/invoices/${data.invoiceId}`);
        } else {
          toast.error('Failed to create sample invoice');
        }
      })
      .catch(error => {
        console.error('Error creating sample invoice:', error);
        toast.error('Error creating sample invoice');
      });
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-4 dark:bg-blue-900/30 dark:text-blue-400 transition-colors duration-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <h3 className="text-2xl font-bold">{invoiceStats.totalCount}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full text-green-600 mr-4 dark:bg-green-900/30 dark:text-green-400 transition-colors duration-200">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <h3 className="text-2xl font-bold">{formatCurrency(invoiceStats.totalAmount)}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 mr-4 dark:bg-yellow-900/30 dark:text-yellow-400 transition-colors duration-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">{invoiceStats.byStatus.pending}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full text-red-600 mr-4 dark:bg-red-900/30 dark:text-red-400 transition-colors duration-200">
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
        <div className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 transition-colors duration-200">
          <ScanLine className="h-3.5 w-3.5 mr-1.5" />
          Scanned: {invoiceStats.bySource.scan}
        </div>
        <div className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 transition-colors duration-200">
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Manual: {invoiceStats.bySource.manual}
        </div>
        <div className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800/50 transition-colors duration-200">
          <DownloadCloud className="h-3.5 w-3.5 mr-1.5" />
          Imported: {invoiceStats.bySource.import}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-2">
        <Button 
          onClick={() => router.push('/invoices/create')}
          className="transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/invoices/scan')}
          className="transition-all duration-200 border-gray-300 dark:border-gray-700"
        >
          <ScanLine className="h-4 w-4 mr-2" />
          Scan Invoice
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/invoices/manual')}
          className="transition-all duration-200 border-gray-300 dark:border-gray-700"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <Label htmlFor="search" className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 transition-colors duration-200">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
              <Input
                id="search"
                placeholder="Search by invoice #, customer, or vendor"
                className="pl-9 border-gray-300 dark:border-gray-700 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="status" className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 transition-colors duration-200">Status</Label>
            <select
              id="status"
              aria-label="Filter by status"
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
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
            <Label htmlFor="source" className="text-gray-700 dark:text-gray-300 font-medium mb-1.5 transition-colors duration-200">Source</Label>
            <select
              id="source"
              aria-label="Filter by source"
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
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
              className="border-gray-300 dark:border-gray-700 transition-colors duration-200"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-gray-300 dark:border-gray-700 transition-colors duration-200"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-gray-300 dark:border-gray-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Add error message display */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900/20 dark:border-red-600 rounded-r-md shadow-sm transition-colors duration-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500 transition-colors duration-200" />
            </div>
            <div className="ml-3 flex items-center justify-between w-full">
              <p className="text-sm text-red-700 dark:text-red-400 transition-colors duration-200">
                {error}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={retryCount >= 3}
                className="ml-4 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                {retryCount >= 3 ? 'Too many retries' : 'Retry'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoices Table */}
      <Card className="p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">All Invoices</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'} found
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-200">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">No invoices found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto transition-colors duration-200">
              No invoices match your current filter criteria. Try adjusting your filters or create a new invoice.
            </p>
            <Button
              onClick={() => router.push('/invoices/create')}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800 transition-colors duration-200">
              <Table className="w-full">
                <TableHead>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50 transition-colors duration-200">
                    <TableHeader 
                      onClick={() => handleSort('invoiceNumber')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Invoice #
                        <SortIndicator field="invoiceNumber" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('date')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Date
                        <SortIndicator field="date" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('customerName')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Customer
                        <SortIndicator field="customerName" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('totalAmount')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Amount
                        <SortIndicator field="totalAmount" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('dueDate')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Due Date
                        <SortIndicator field="dueDate" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('status')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Status
                        <SortIndicator field="status" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('source')}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors duration-200 py-3 px-4 text-left"
                    >
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Source
                        <SortIndicator field="source" />
                      </div>
                    </TableHeader>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/50 transition-colors duration-200 py-3 px-4 text-left">
                      <div className="flex items-center font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Actions
                      </div>
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvoices.map((invoice, index) => (
                    <TableRow 
                      key={invoice.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-900/70'
                      } hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200`}
                    >
                      <TableCell className="py-3 px-4">
                        <Link href={`/invoices/${invoice.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors duration-200">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="py-3 px-4">{formatDate(invoice.date)}</TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{invoice.customerName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{invoice.vendorName}</div>
                      </TableCell>
                      <TableCell className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell className="py-3 px-4 text-gray-700 dark:text-gray-300 transition-colors duration-200">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="py-3 px-4">
                        <StatusBadge status={invoice.status || 'pending'} />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <SourceBadge source={invoice.source} />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                            className="h-8 w-8 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                            className="h-8 w-8 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-400 transition-colors duration-200">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, invoices.length)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, invoices.length)}</span> of{' '}
                <span className="font-medium">{invoices.length}</span> results
              </p>
              <div className="flex flex-wrap gap-1">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 transition-colors duration-200"
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
                    className={currentPage === i + 1 ? 
                      'transition-colors duration-200' : 
                      'border-gray-300 dark:border-gray-700 transition-colors duration-200'}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === (totalPages || 1) || loading}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700 transition-colors duration-200"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      
      {/* Add this button somewhere in the UI */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button 
          onClick={() => handleViewSampleInvoice('standard')}
          variant="outline"
          size="sm"
        >
          Standard Invoice
        </Button>
        <Button 
          onClick={() => handleViewSampleInvoice('premium')}
          variant="outline"
          size="sm"
        >
          Premium Invoice
        </Button>
        <Button 
          onClick={() => handleViewSampleInvoice('maintenance')}
          variant="outline"
          size="sm"
        >
          Maintenance Invoice
        </Button>
        <Button 
          onClick={() => handleViewSampleInvoice('consulting')}
          variant="outline"
          size="sm"
        >
          Consulting Invoice
        </Button>
        <Button 
          onClick={() => handleViewSampleInvoice('hardware')}
          variant="outline"
          size="sm"
        >
          Hardware Invoice
        </Button>
      </div>
      
      {isGuest && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-r-md shadow-sm transition-colors duration-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 transition-colors duration-200">Guest Mode Notice</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 transition-colors duration-200">
                <p>
                  In guest mode, you can view sample invoices and try out features, but changes won&apos;t be saved. 
                  <br /> 
                  <a href="/auth/login" className="font-medium underline hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200">Sign in</a> or <a href="/auth/register" className="font-medium underline hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200">create an account</a> to save your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 