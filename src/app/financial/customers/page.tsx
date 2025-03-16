'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CreditCard,
  Calendar,
  ExternalLink,
  Download,
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

// Mock data for customers
const mockCustomers = [
  {
    id: 'cust-1',
    name: 'Acme Corporation',
    email: 'billing@acmecorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100, San Francisco, CA 94107',
    stripeId: 'cus_123456',
    totalSpent: 25000,
    lastInvoice: '2023-11-15',
    invoiceCount: 12,
    status: 'active' as const,
  },
  {
    id: 'cust-2',
    name: 'TechGiant Inc',
    email: 'accounts@techgiant.co',
    phone: '+1 (555) 987-6543',
    address: '456 Technology Pkwy, Mountain View, CA 94043',
    stripeId: 'cus_234567',
    totalSpent: 85000,
    lastInvoice: '2023-12-01',
    invoiceCount: 24,
    status: 'active' as const,
  },
  {
    id: 'cust-3',
    name: 'Mega Industries',
    email: 'finance@megaindustries.com',
    phone: '+1 (555) 456-7890',
    address: '789 Manufacturing Blvd, Detroit, MI 48201',
    stripeId: 'cus_345678',
    totalSpent: 45000,
    lastInvoice: '2023-11-28',
    invoiceCount: 18,
    status: 'active' as const,
  },
  {
    id: 'cust-4',
    name: 'Small Business LLC',
    email: 'owner@smallbiz.co',
    phone: '+1 (555) 234-5678',
    address: '321 Main St, Portland, OR 97204',
    stripeId: 'cus_456789',
    totalSpent: 7500,
    lastInvoice: '2023-10-22',
    invoiceCount: 6,
    status: 'inactive' as const,
  },
  {
    id: 'cust-5',
    name: 'Medium Enterprises',
    email: 'accounting@medium-ent.com',
    phone: '+1 (555) 876-5432',
    address: '567 Corporate Drive, Chicago, IL 60601',
    stripeId: 'cus_567890',
    totalSpent: 32000,
    lastInvoice: '2023-11-05',
    invoiceCount: 15,
    status: 'active' as const,
  },
];

// Define customer type
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  stripeId: string;
  totalSpent: number;
  lastInvoice: string;
  invoiceCount: number;
  status: 'active' | 'inactive';
};

export default function CustomersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isGuest = session?.user?.role === 'guest';
  
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );
  
  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Toggle details for selected customer
  const toggleCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer);
  };

  // Handle deleting a customer
  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      // In a real app, you would call an API to delete the customer
      setCustomers(customers.filter(customer => customer.id !== customerId));
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <PageHeader
        title="Customer Management"
        description="Manage your customer profiles and view their invoicing history"
        actions={
          <Button onClick={() => setIsAddingCustomer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      />
      
      {isGuest && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                You are viewing sample data in guest mode. Changes will not be saved.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col space-y-6">
        {/* Search and Filter Bar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Customer List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Total Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Last Invoice
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCustomers.map((customer) => (
                  <React.Fragment key={customer.id}>
                    <tr 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                      onClick={() => toggleCustomerDetails(customer)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.invoiceCount} invoices</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(customer.lastInvoice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
                        }`}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/financial/automated-invoicing/new?customerId=${customer.id}`);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Create Invoice</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingCustomer(true);
                              setSelectedCustomer(customer);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(customer.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded customer details */}
                    {selectedCustomer?.id === customer.id && (
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                              <div className="flex flex-col space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h4>
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900 dark:text-white">{customer.email}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900 dark:text-white">{customer.phone}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                                        <span className="text-sm text-gray-900 dark:text-white">{customer.address}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Information</h4>
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center">
                                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900 dark:text-white">Stripe ID: {customer.stripeId}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-900 dark:text-white">Last Invoice: {formatDate(customer.lastInvoice)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Financial Summary</h3>
                              
                              <div className="mt-4 space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</h4>
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(customer.totalSpent)}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice History</h4>
                                  <p className="text-sm text-gray-900 dark:text-white">{customer.invoiceCount} invoices</p>
                                </div>
                                
                                <div className="pt-4 space-y-2">
                                  <Button 
                                    className="w-full justify-center"
                                    onClick={() => router.push(`/financial/automated-invoicing/new?customerId=${customer.id}`)}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create New Invoice
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-center"
                                    onClick={() => router.push(`/financial/customers/${customer.id}/invoices`)}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View All Invoices
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No customers found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* Add/Edit Customer Modal */}
      {(isAddingCustomer || isEditingCustomer) && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" onClick={() => {
              setIsAddingCustomer(false);
              setIsEditingCustomer(false);
            }}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {isAddingCustomer ? 'Add New Customer' : 'Edit Customer'}
                </h3>
                
                <div className="mt-4">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Customer Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        defaultValue={selectedCustomer?.name || ''}
                        placeholder="Company or individual name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={selectedCustomer?.email || ''}
                        placeholder="customer@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue={selectedCustomer?.phone || ''}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address
                      </label>
                      <textarea
                        id="address"
                        rows={3}
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        defaultValue={selectedCustomer?.address || ''}
                        placeholder="Full address"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        id="status"
                        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        defaultValue={selectedCustomer?.status || 'active'}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button className="w-full sm:w-auto sm:ml-2" onClick={() => {
                  setIsAddingCustomer(false);
                  setIsEditingCustomer(false);
                  
                  // In a real app, you would save the customer data here
                  if (isGuest) {
                    alert('In guest mode, changes are not saved. This is a demo feature.');
                  } else {
                    alert('Customer saved successfully!');
                  }
                }}>
                  {isAddingCustomer ? 'Add Customer' : 'Save Changes'}
                </Button>
                <Button variant="outline" className="mt-3 w-full sm:mt-0 sm:w-auto" onClick={() => {
                  setIsAddingCustomer(false);
                  setIsEditingCustomer(false);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 