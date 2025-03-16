import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Cog, FileText, ArrowUpDown, CreditCard, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automated Invoicing - StockSage',
  description: 'Create and manage invoices automatically with Stripe integration',
};

export default function AutomatedInvoicingPage() {
  return (
    <div className="flex flex-col space-y-8">
      <PageHeader
        title="Automated Invoicing"
        description="Create, send, and track invoices automatically with Stripe integration"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Overview</h2>
              <Button variant="outline" size="sm">
                <Cog className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</h3>
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Start creating invoices
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payments</h3>
                  <CreditCard className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">$0.00</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No payments received yet
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sync Status</h3>
                  <ArrowUpDown className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Ready</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Connect with Zoho Inventory
                </p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild>
                  <Link href="/financial/automated-invoicing/create">
                    Create New Invoice
                  </Link>
                </Button>
                <Button variant="outline">
                  Import Customers
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Connected Services</h2>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white p-2 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12H18" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V18" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Stripe</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
              </div>
              <BadgeCheck className="h-5 w-5 text-green-500 ml-auto" />
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white p-2 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" fill="#ECEBFA" />
                  <path d="M12 6V18" stroke="#5C59DF" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 12H6" stroke="#5C59DF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Zoho Inventory</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connect to sync inventory</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto">Connect</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white p-2 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" fill="#F2F7FF" />
                  <path d="M19 9L12 16L5 9" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Configure email settings</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto">Setup</Button>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Invoice Templates</h2>
              <Button size="sm" variant="outline">
                Customize Templates
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-3 aspect-h-4 bg-gray-100 dark:bg-gray-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-[200px] bg-white shadow-lg rounded-lg p-4 flex flex-col">
                      <div className="w-full h-4 bg-blue-500 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="mt-4 flex-1 border-t border-gray-200 pt-2">
                        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium">Default Template</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Professional design with logo</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-3 aspect-h-4 bg-gray-100 dark:bg-gray-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-[200px] bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg rounded-lg p-4 flex flex-col">
                      <div className="w-8 h-8 bg-white rounded-full mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-blue-400 bg-opacity-30 rounded w-3/4"></div>
                        <div className="h-2 bg-blue-400 bg-opacity-30 rounded w-1/2"></div>
                        <div className="h-2 bg-blue-400 bg-opacity-30 rounded w-2/3"></div>
                      </div>
                      <div className="mt-4 flex-1 border-t border-blue-400 border-opacity-30 pt-2">
                        <div className="h-2 bg-blue-400 bg-opacity-30 rounded w-full mb-2"></div>
                        <div className="h-2 bg-blue-400 bg-opacity-30 rounded w-full mb-2"></div>
                        <div className="h-2 bg-blue-400 bg-opacity-30 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium">Modern Template</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Colorful modern design</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-3 aspect-h-4 bg-gray-100 dark:bg-gray-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-[200px] bg-white shadow-lg rounded-lg p-4 flex flex-col">
                      <div className="w-full flex justify-between items-center mb-8">
                        <div className="h-3 bg-gray-900 rounded w-1/4"></div>
                        <div className="h-3 w-3 rounded-full bg-gray-900"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="mt-4 flex-1 pt-2">
                        <div className="h-[1px] bg-gray-900 w-full mb-4"></div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium">Minimal Template</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Clean, minimalist design</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Activity</h2>
              <Button size="sm" variant="outline">View All</Button>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center text-center max-w-md">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Invoice Activity Yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Once you create and send invoices, your activity will appear here. Get started by creating your first invoice.
                  </p>
                  <Button className="mt-4">
                    <Link href="/financial/automated-invoicing/create">
                      Create First Invoice
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 