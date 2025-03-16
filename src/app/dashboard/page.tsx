'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, Package, ShoppingCart, AlertTriangle, PlusCircle, FileText, PieChart, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const isGuest = session?.user?.role === 'guest';
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency function
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
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Calculate time difference for recent activities
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMilliseconds = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <AppLayout>
      {/* Welcome section with quick stats */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-900 rounded-xl p-6 shadow-lg text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}</h1>
              <p className="mt-2 text-indigo-100">Here's what's happening with your business today.</p>
            </div>
            {isGuest && (
              <span className="mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400/20 text-yellow-100 border border-yellow-400/30">
                Guest Mode
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-200 text-sm">Today's Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.salesSummary ? formatCurrency(dashboardData.salesSummary.today) : '$0'}</h3>
              <div className="text-green-300 text-sm mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+2.5% from yesterday</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-200 text-sm">Total Products</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.totalProducts || 0}</h3>
              <div className="text-indigo-200 text-sm mt-2">
                <span>{dashboardData?.lowStockItems || 0} low stock items</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-200 text-sm">Active Orders</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.activeOrders || 0}</h3>
              <div className="text-indigo-200 text-sm mt-2">
                <span>{dashboardData?.recentActivities?.filter(a => a.type === 'order').length || 0} new today</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-indigo-200 text-sm">Pending Payments</p>
              <h3 className="text-2xl font-bold mt-1">{dashboardData?.pendingPayments || 0}</h3>
              <div className="text-yellow-300 text-sm mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>{dashboardData?.overduePayments || 0} overdue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGuest && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-600">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                You are currently using <strong>Guest Mode</strong>. Some features may be limited.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-[250px] animate-pulse">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 mb-4 rounded"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((line) => (
                  <div key={line} className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
                <div className="mt-4 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Inventory Summary" icon={<Package className="h-5 w-5" />} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Products</span>
                  <span className="text-xl font-semibold">{dashboardData?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Low Stock Items</span>
                  <span className="text-xl font-semibold text-yellow-600 dark:text-yellow-500">
                    {dashboardData?.lowStockItems || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Out of Stock</span>
                  <span className="text-xl font-semibold text-red-600 dark:text-red-500">
                    {dashboardData?.outOfStockItems || 0}
                  </span>
                </div>
                <Link href="/inventory" className="block mt-4">
                  <Button variant="secondary" fullWidth>
                    View Inventory
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card title="Sales Overview" icon={<BarChart3 className="h-5 w-5" />} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Today</span>
                  <span className="text-xl font-semibold">{dashboardData?.salesSummary ? formatCurrency(dashboardData.salesSummary.today) : '$0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="text-xl font-semibold">{dashboardData?.salesSummary ? formatCurrency(dashboardData.salesSummary.thisWeek) : '$0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">This Month</span>
                  <span className="text-xl font-semibold">{dashboardData?.salesSummary ? formatCurrency(dashboardData.salesSummary.thisMonth) : '$0'}</span>
                </div>
                <Link href="/sales" className="block mt-4">
                  <Button variant="secondary" fullWidth>
                    View Sales
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card title="Recent Activities" icon={<FileText className="h-5 w-5" />} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {dashboardData?.recentActivities?.slice(0, 3).map((activity) => {
                  let borderColor = "border-gray-500";
                  let icon = <FileText className="h-4 w-4" />;
                  
                  if (activity.type === 'order') {
                    borderColor = "border-green-500";
                    icon = <ShoppingCart className="h-4 w-4 text-green-500" />;
                  } else if (activity.type === 'inventory') {
                    borderColor = "border-blue-500";
                    icon = <Package className="h-4 w-4 text-blue-500" />;
                  } else if (activity.type === 'alert') {
                    borderColor = "border-yellow-500";
                    icon = <AlertTriangle className="h-4 w-4 text-yellow-500" />;
                  }

                  return (
                    <div key={activity.id} className={`border-l-4 ${borderColor} pl-2 flex items-start`}>
                      <div className="mr-2 mt-0.5">{icon}</div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
                <Link href="/activities" className="block mt-4">
                  <Button variant="secondary" fullWidth>
                    View All Activities
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          
          {/* Getting Started CTA Section */}
          <div className="mt-8 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Get Started with StockSage</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Complete these steps to optimize your business workflow</p>
              </div>
              <Button variant="default" className="mt-4 md:mt-0">
                View Tutorials
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className={`rounded-lg p-4 border ${dashboardData?.totalProducts ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dashboardData?.totalProducts ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} mr-3`}>
                    {dashboardData?.totalProducts ? '✓' : '1'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Add Products</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {dashboardData?.totalProducts ? `${dashboardData.totalProducts} products added` : 'Add your first product to inventory'}
                    </p>
                    {!dashboardData?.totalProducts && (
                      <Link href="/inventory/add">
                        <Button variant="link" className="mt-1 h-auto p-0 text-blue-600 dark:text-blue-400">
                          Add product →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`rounded-lg p-4 border ${dashboardData?.recentInvoices?.length ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dashboardData?.recentInvoices?.length ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} mr-3`}>
                    {dashboardData?.recentInvoices?.length ? '✓' : '2'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Create Invoice</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {dashboardData?.recentInvoices?.length ? `${dashboardData.recentInvoices.length} invoices created` : 'Create your first invoice'}
                    </p>
                    {!dashboardData?.recentInvoices?.length && (
                      <Link href="/invoices/create">
                        <Button variant="link" className="mt-1 h-auto p-0 text-blue-600 dark:text-blue-400">
                          Create invoice →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg p-4 border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-3">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Connect Payment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Set up Stripe for online payments
                    </p>
                    <Link href="/settings/payments">
                      <Button variant="link" className="mt-1 h-auto p-0 text-blue-600 dark:text-blue-400">
                        Connect →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg p-4 border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-3">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Invite Team</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Add team members to collaborate
                    </p>
                    <Link href="/settings/team">
                      <Button variant="link" className="mt-1 h-auto p-0 text-blue-600 dark:text-blue-400">
                        Invite →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <Tabs defaultValue="topProducts" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="topProducts">Top Products</TabsTrigger>
                  <TabsTrigger value="recentInvoices">Recent Invoices</TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Link href="/inventory/add">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </Link>
                  <Link href="/invoices/create">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      New Invoice
                    </Button>
                  </Link>
                </div>
              </div>
              
              <TabsContent value="topProducts">
                <Card className="mt-2 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {dashboardData?.topSellingProducts?.map((item, index) => (
                      <div key={item.product.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between">
                          <div className="flex">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                              index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : 
                              index === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            } mr-3`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-500">{item.product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(item.product.price * item.soldQuantity)}</p>
                            <p className="text-sm text-gray-500">{item.soldQuantity} units sold</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="recentInvoices">
                <Card className="mt-6">
                  <div className="space-y-4">
                    {dashboardData?.recentInvoices?.map((invoice) => (
                      <div key={invoice.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                            <p className="text-sm text-gray-500">{invoice.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(invoice.totalAmount)}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </AppLayout>
  );
} 