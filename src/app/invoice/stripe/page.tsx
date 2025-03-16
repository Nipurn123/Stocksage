'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ExternalLink, Download, RefreshCw, Copy, Check, X, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
      setInvoices(generateMockInvoices());
      setIsLoading(false);
      setIsConnected(true);
    }, 1500);
  }, []);

  // Generate mock invoices for demonstration
  const generateMockInvoices = (): StripeInvoice[] => {
    const statuses: ('draft' | 'open' | 'paid' | 'uncollectible' | 'void')[] = ['draft', 'open', 'paid', 'paid', 'paid', 'void'];
    const customers = [
      { id: 'cus_123', name: 'Ethnic Retail Store', email: 'accounts@ethnicretail.com' },
      { id: 'cus_456', name: 'Luxe Boutique', email: 'finance@luxeboutique.com' },
      { id: 'cus_789', name: 'Handloom Cooperative', email: 'billing@handloomcoop.org' },
      { id: 'cus_101', name: 'Fashion Exports Ltd', email: 'accounts@fashionexports.com' },
      { id: 'cus_112', name: 'Craft Bazaar', email: 'payments@craftbazaar.in' }
    ];
    
    const subscriptions = [
      'Premium Textile Catalog Access',
      'Monthly Fabric Supply',
      'Quarterly Design Consultation',
      'Annual Trade Show Partnership', 
      null
    ];
    
    return Array.from({ length: 12 }, (_, i) => {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 100000) + 5000; // 5000-105000
      const createdDate = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
      const subscription = subscriptions[Math.floor(Math.random() * subscriptions.length)];
      
      return {
        id: `in_${Math.random().toString(36).substr(2, 9)}`,
        customer,
        status,
        amount_due: status === 'paid' ? 0 : amount,
        amount_paid: status === 'paid' ? amount : 0,
        description: subscription || 'One-time textile order',
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
          <h1 className="text-2xl font-bold tracking-tight">Stripe Invoicing</h1>
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
                      setInvoices(generateMockInvoices());
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
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={() => copyToClipboard(invoice.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
                              title="Copy invoice ID"
                            >
                              {copied === invoice.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.id}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {invoice.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.customer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.customer.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusBadgeColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(invoice.status === 'paid' ? invoice.amount_paid : invoice.amount_due, invoice.currency)}
                          </div>
                          {invoice.subscription && (
                            <div className="text-xs text-indigo-500 dark:text-indigo-400">Recurring</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(invoice.created)}</div>
                          {invoice.due_date && invoice.status !== 'paid' && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Due: {formatDate(invoice.due_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download invoice</span>
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">View invoice details</span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Stripe Integration Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Create professional recurring invoices</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Automatic payment collection via saved cards</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Beautiful hosted invoice pages for customers</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Automated reminders for unpaid invoices</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Multi-currency support for global clients</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Subscription Models</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Common subscription models for textile businesses:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                    1
                  </div>
                  <span className="text-sm"><strong>Monthly Fabric Box:</strong> Regular deliveries of curated fabrics</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                    2
                  </div>
                  <span className="text-sm"><strong>Design Consultation:</strong> Quarterly design guidance sessions</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                    3
                  </div>
                  <span className="text-sm"><strong>Sample Program:</strong> Early access to new textile collections</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                    4
                  </div>
                  <span className="text-sm"><strong>Trade Membership:</strong> Wholesale pricing and priority ordering</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Get Started</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Follow these steps to set up Stripe invoicing for your textile business:
              </p>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-2">
                    1
                  </div>
                  <span className="text-sm">Connect your Stripe account in settings</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-2">
                    2
                  </div>
                  <span className="text-sm">Set up your business branding and invoice templates</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-2">
                    3
                  </div>
                  <span className="text-sm">Create customer profiles with payment methods</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-2">
                    4
                  </div>
                  <span className="text-sm">Set up your product catalog and subscription plans</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-2">
                    5
                  </div>
                  <span className="text-sm">Create your first invoice or subscription</span>
                </li>
              </ol>
              <div className="mt-4">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Stripe Documentation
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 