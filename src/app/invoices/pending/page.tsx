'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Pagination,
  DateRangePicker
} from '@/components/ui';
import { 
  Search, 
  Plus, 
  FileDown, 
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import type { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import Link from 'next/link';

export default function PendingInvoicesPage() {
  const router = useRouter();
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const itemsPerPage = 10;
  
  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // In a real scenario, this would be a fetch from your API with status filter
        // const response = await fetch('/api/invoices?status=pending');
        // const data = await response.json();
        // setInvoices(data);
        
        // Simulate API call with delay
        setTimeout(() => {
          // Filter for pending invoices only
          const pendingInvoices = [
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
              status: 'pending' as const,
              items: [],
              createdAt: '2023-05-20T14:15:00Z',
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
              status: 'pending' as const,
              items: [],
              createdAt: '2023-06-05T16:30:00Z',
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
              status: 'pending' as const,
              items: [],
              createdAt: '2023-06-15T09:20:00Z',
            }
          ] as Invoice[];
          
          setInvoices(pendingInvoices);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching pending invoices:', error);
        toast.error('Failed to load pending invoices');
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);
  
  // Apply filters
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
    
    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      result = result.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= fromDate && invoiceDate <= toDate;
      });
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
  }, [invoices, searchTerm, dateRange, sortField, sortDirection]);
  
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  
  const handleSort = (field: string) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const exportToCSV = () => {
    // Implementation for exporting invoices to CSV
    alert('Export functionality to be implemented');
  };
  
  // Sort indicator component
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pending Invoices</h1>
          <p className="text-gray-500">Manage invoices awaiting payment</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/invoices/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
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
          
          <div className="w-full md:w-1/3">
            <Label htmlFor="date-range">Due Date Range</Label>
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
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                // Simulate refresh
                setTimeout(() => {
                  setLoading(false);
                }, 500);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Invoices Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pending Invoices</h3>
          <div className="text-sm text-gray-500">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'} pending payment
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending invoices found matching your criteria
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
                    <TableHead>Days Until Due</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => {
                    const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                    const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0;
                    const isOverdue = daysUntilDue < 0;
                    
                    return (
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOverdue 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                              : isDueSoon 
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {isOverdue 
                              ? `${Math.abs(daysUntilDue)} days overdue` 
                              : daysUntilDue === 0 
                                ? 'Due today'
                                : `${daysUntilDue} days`
                            }
                          </span>
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
                              onClick={() => {
                                // Mark as paid functionality
                                toast.success(`Invoice ${invoice.invoiceNumber} marked as paid`);
                                // In a real app, this would call an API to update the invoice status
                                setInvoices(invoices.filter(inv => inv.id !== invoice.id));
                              }}
                            >
                              Mark Paid
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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