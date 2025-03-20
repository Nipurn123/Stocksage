'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AppLayout from '@/components/layout/AppLayout';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Input, Select } from '@/components/ui';
import Link from 'next/link';
import { ArrowUpRight, UserPlus, Search, ChevronLeft, ChevronRight, PieChart, BarChart3, Users, Phone, Mail, Building, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Customer, CustomerStats, PaginatedResponse } from '@/types';

export default function CustomersPage() {
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch customers data with pagination, search, and sorting
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          search: searchTerm,
          sortBy,
          sortDirection
        });
        
        const response = await fetch(`/api/customers?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setCustomers(data.data.items);
          setTotalPages(data.data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [page, searchTerm, sortBy, sortDirection]);

  // Fetch customer stats
  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        setIsStatsLoading(true);
        const response = await fetch('/api/customers/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch customer stats');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setCustomerStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching customer stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchCustomerStats();
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Handle sorting
  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortDirection('desc'); // Default to desc when changing sort field
    }
    setPage(1); // Reset to first page when sorting changes
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view customer information</p>
        </div>
        <Link href="/customers/add">
          <Button variant="default" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  customerStats?.totalCustomers || 0
                )}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  customerStats?.newCustomersThisMonth || 0
                )}
              </h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top Customer Spent</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  customerStats?.topCustomers?.[0] 
                    ? formatCurrency(customerStats.topCustomers[0].totalSpent) 
                    : '$0'
                )}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  // Calculate mock growth rate
                  `+${Math.floor(Math.random() * 20) + 2}%`
                )}
              </h3>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for All Customers and Customer Analytics */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="analytics">Customer Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                options={[
                  { value: "fullName", label: "Name" },
                  { value: "totalSpent", label: "Total Spent" },
                  { value: "lastPurchaseDate", label: "Last Purchase" },
                  { value: "createdAt", label: "Date Added" }
                ]}
              />

              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>

          {/* Customers Table */}
          <Card className="mb-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Location</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Last Purchase</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    // Loading state - show skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-900">
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded ml-auto"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : customers.length === 0 ? (
                    // Empty state
                    <tr className="bg-white dark:bg-gray-900">
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-lg font-medium">No customers found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                          <Button variant="outline" className="mt-4" onClick={() => {
                            setSearchTerm('');
                            setSortBy('createdAt');
                            setSortDirection('desc');
                          }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Customer rows
                    customers.map((customer) => (
                      <tr 
                        key={customer.id} 
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                              {customer.fullName.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.fullName}</p>
                              {customer.company && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{customer.company}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3.5 w-3.5 mr-2" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <Phone className="h-3.5 w-3.5 mr-2" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {customer.city ? `${customer.city}, ${customer.state}` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(customer.totalSpent)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'Never'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="More options"
                            aria-label="More options for this customer"
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination controls */}
          {!isLoading && customers.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing page {page} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card title="Top Customers" icon={<Users className="h-5 w-5" />} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {isStatsLoading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 animate-pulse">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))
                ) : (
                  customerStats?.topCustomers?.map((item, index) => (
                    <div 
                      key={item.customer.id} 
                      className="border-b last:border-0 pb-4 last:pb-0 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                          index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : 
                          index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{item.customer.fullName}</p>
                          <p className="text-sm text-gray-500">{item.orderCount} orders</p>
                        </div>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.totalSpent)}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            {/* Customer Growth */}
            <Card title="Customer Growth" icon={<BarChart3 className="h-5 w-5" />} className="hover:shadow-md transition-shadow">
              <div className="h-60 flex items-center justify-center">
                {isStatsLoading ? (
                  <div className="text-center">
                    <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-end justify-between px-2">
                    {customerStats?.customersByMonth?.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-indigo-500 dark:bg-indigo-600 rounded-t w-10" 
                          style={{ 
                            height: `${Math.max(20, (item.count / Math.max(...customerStats.customersByMonth.map(m => m.count))) * 180)}px` 
                          }}
                        ></div>
                        <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">{item.month}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer detail dialog could be added here */}
    </AppLayout>
  );
} 