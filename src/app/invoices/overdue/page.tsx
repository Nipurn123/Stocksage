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
  AlertTriangle,
  Clock,
  Mail
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import type { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import Link from 'next/link';

// Extended invoice interface with overdue details
interface OverdueInvoice extends Invoice {
  daysOverdue?: number;
}

export default function OverdueInvoicesPage() {
  const router = useRouter();
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  
  const [invoices, setInvoices] = useState<OverdueInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<OverdueInvoice[]>([]);
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
        // const response = await fetch('/api/invoices?status=overdue');
        // const data = await response.json();
        // setInvoices(data);
        
        // Simulate API call with delay
        setTimeout(() => {
          // Filter for overdue invoices only
          const overdueInvoices: OverdueInvoice[] = [
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
              status: 'overdue' as const,
              items: [],
              createdAt: '2023-05-25T09:45:00Z',
              daysOverdue: 15
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
              status: 'overdue' as const,
              items: [],
              createdAt: '2023-06-20T10:15:00Z',
              daysOverdue: 5
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
              status: 'overdue' as const,
              items: [],
              createdAt: '2023-06-01T14:30:00Z',
              daysOverdue: 25
            }
          ];
          
          setInvoices(overdueInvoices);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching overdue invoices:', error);
        toast.error('Failed to load overdue invoices');
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
        case 'daysOverdue':
          aValue = a.daysOverdue || 0;
          bValue = b.daysOverdue || 0;
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
  
  // Calculate days overdue
  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Send reminder email
  const sendReminder = (invoice: Invoice) => {
    // In a real app, this would call an API to send an email
    toast.success(`Reminder sent to ${invoice.customerName}`);
  };
  
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overdue Invoices</h1>
          <p className="text-gray-500">Manage invoices past their due date</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Send reminders to all overdue invoices
              if (filteredInvoices.length > 0) {
                toast.success(`Sending reminders to ${filteredInvoices.length} customers`);
              } else {
                toast.error('No overdue invoices to send reminders for');
              }
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send All Reminders
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
          <h3 className="text-lg font-medium">Overdue Invoices</h3>
          <div className="text-sm text-gray-500">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'} overdue
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No overdue invoices found matching your criteria
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader 
                      onClick={() => handleSort('invoiceNumber')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Invoice #
                        <SortIndicator field="invoiceNumber" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('date')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Date
                        <SortIndicator field="date" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('customerName')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Customer
                        <SortIndicator field="customerName" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('totalAmount')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Amount
                        <SortIndicator field="totalAmount" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('dueDate')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Due Date
                        <SortIndicator field="dueDate" />
                      </div>
                    </TableHeader>
                    <TableHeader 
                      onClick={() => handleSort('daysOverdue')}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        Days Overdue
                        <SortIndicator field="daysOverdue" />
                      </div>
                    </TableHeader>
                    <TableHeader>
                      <div className="flex items-center">
                        Actions
                      </div>
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvoices.map((invoice) => {
                    const daysOverdue = invoice.daysOverdue || getDaysOverdue(invoice.dueDate);
                    const severityClass = daysOverdue > 30 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                      : daysOverdue > 14 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
                    
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
                        <TableCell>
                          <span className="text-red-600 dark:text-red-400">
                            {formatDate(invoice.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityClass}`}>
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            {daysOverdue} days
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
                              onClick={() => sendReminder(invoice)}
                            >
                              Send Reminder
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