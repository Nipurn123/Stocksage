'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ExternalLink, Download, RefreshCw, Copy, Check, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';

// Mock types for Stripe invoices
interface StripeInvoice {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number;
  amount_paid: number;
  description: string;
  currency: string;
  created: number;
  due_date: number | null;
  subscription: string | null;
}

export default function StripeInvoicing() {
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch mock invoices
  useEffect(() => {
    // In a real app, this would be an API call to your backend
    // which would then use the Stripe API to fetch invoices
    setTimeout(() => {
      setInvoices(getMockStripeInvoices());
      setIsLoading(false);
      setIsConnected(true);
    }, 1500);
  }, []);

  // Mock data for stripe invoices
  const getMockStripeInvoices = () => {
    const statuses: ('draft' | 'open' | 'paid' | 'uncollectible' | 'void')[] = ['draft', 'open', 'paid', 'paid', 'paid', 'void'];
    const customers = [
      { id: 'cus_ERS123', name: 'Ethnic Retail Store', email: 'accounts@ethnicretail.com' },
      { id: 'cus_LB456', name: 'Luxe Boutique', email: 'finance@luxeboutique.com' },
      { id: 'cus_HE789', name: 'Handicraft Emporium', email: 'purchasing@handicraftemporium.com' },
      { id: 'cus_CA101', name: 'Cultural Artifacts', email: 'procurement@culturalartifacts.in' },
      { id: 'cus_AO112', name: 'Artisan Outlet', email: 'orders@artisanoutlet.com' }
    ];
    
    const subscriptions = [
      'WeaveMitra Premium Collection Access',
      'Monthly Handloom Supply',
      'Quarterly Textile Consultation',
      'Annual Handloom Exhibition Partnership', 
      null
    ];
    
    return Array.from({ length: 12 }, (_, i) => {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 50000) + 15000; // 15000-65000 INR
      const createdDate = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
      const subscription = subscriptions[Math.floor(Math.random() * subscriptions.length)];
      
      return {
        id: `in_${Math.random().toString(36).substr(2, 9)}`,
        customer,
        status,
        amount_due: status === 'paid' ? 0 : amount,
        amount_paid: status === 'paid' ? amount : 0,
        description: subscription || 'Handloom textile order - WeaveMitra',
        currency: 'inr',
        created: createdDate,
        due_date: createdDate + (15 * 24 * 60 * 60 * 1000), // 15 days after creation
        subscription: subscription ? `sub_${Math.random().toString(36).substr(2, 9)}` : null,
      };
    });
  };

  // Filter invoices based on search query and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return formatter.format(amount / 100);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Copy invoice ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'uncollectible': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'void': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Stripe Invoicing</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Create and manage recurring invoices with Stripe's powerful invoicing system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {}} 
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {!isConnected && !isLoading ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Connect Stripe Account</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              Link your Stripe account to enable invoicing features and start managing your recurring payments seamlessly.
            </p>
            <Button className="flex items-center">
              <svg 
                className="h-4 w-4 mr-2" 
                viewBox="0 0 32 32" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M32 16.032C32 7.178 24.836 0 16 0S0 7.178 0 16.032c0 8.853 7.164 16.032 16 16.032s16-7.18 16-16.032z" fill="#fff"/>
                <path d="M16.138 7.812c-4.487 0-8.13 3.212-8.13 7.171 0 2.988 1.96 4.832 4.889 4.832 3.445 0 5.813-2.284 5.813-5.432 0-2.387-1.646-3.816-4.008-3.816-1.337 0-2.328.612-2.778 1.373h-.092c.061-1.665 1.369-2.987 3.076-2.987 2.113 0 3.69 1.602 3.69 3.724 0 2.989-2.39 6.068-6.215 6.068-3.936 0-6.307-2.958-6.307-6.743 0-4.038 2.96-7.842 7.849-7.842 2.298 0 4.008.734 5.07 1.755l.826-1.32c-1.215-1.113-3.29-1.783-6.002-1.783h.32zm-1.615 9.395c0 1.08.704 1.726 1.66 1.726.979 0 1.805-.674 2.052-1.692.031-.153.061-.337.061-.52 0-1.082-.704-1.727-1.661-1.727-.948 0-1.96.705-2.112 2.213z" fill="#6772e5"/>
              </svg>
              Connect with Stripe
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices by customer or description..."
                  className="pl-9 w-full rounded-md border border-gray-200 py-2 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search invoices"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    className="pl-9 rounded-md border border-gray-200 py-2 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    title="Filter by status"
                    aria-label="Filter invoices by status"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="paid">Paid</option>
                    <option value="uncollectible">Uncollectible</option>
                    <option value="void">Void</option>
                  </select>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setInvoices(getMockStripeInvoices());
                      setIsLoading(false);
                    }, 1000);
                  }}
                  disabled={isLoading}
                  className="flex items-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No invoices found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={() => copyToClipboard(invoice.id)}
                              className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mr-2"
                              title="Copy invoice ID"
                              aria-label="Copy invoice ID"
                            >
                              {copied === invoice.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <span className="font-mono text-xs text-gray-800 dark:text-gray-200">
                              {invoice.id}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {invoice.description}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.customer.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {invoice.customer.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(invoice.amount_due > 0 ? invoice.amount_due : invoice.amount_paid, invoice.currency)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.created)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="View invoice details"
                              aria-label="View invoice details"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Download invoice"
                              aria-label="Download invoice"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Subscription Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage your recurring subscription invoices from this dashboard. You can create, edit, and manage all your subscription billing settings.
            </p>
            <Button variant="outline">
              View Subscriptions
            </Button>
          </Card>
        </>
      )}
    </div>
  );
} 