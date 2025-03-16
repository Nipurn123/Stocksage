'use client';

import React, { useState } from 'react';
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Calendar, 
  Users, 
  Clock, 
  RefreshCcw, 
  FileDown,
  Truck,
  Package,
  LineChart,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [reportType, setReportType] = useState<'overview' | 'suppliers' | 'orders' | 'cost' | 'forecast'>('overview');
  
  // Sample data for charts and metrics
  const metrics = {
    totalOrders: 245,
    totalSpend: 752000,
    avgLeadTime: 4.5, // days
    onTimeDelivery: 94, // percentage
    inventoryTurn: 12.5, // times per year
    suppliersCount: 24,
    activeOrders: 18,
    topSpendCategories: [
      { name: 'Raw Cotton', percentage: 35 },
      { name: 'Dyes', percentage: 22 },
      { name: 'Yarn', percentage: 18 },
      { name: 'Equipment', percentage: 15 },
      { name: 'Other', percentage: 10 }
    ],
    supplierPerformance: [
      { name: 'Yarn Spinners Ltd.', rating: 4.8, onTime: 98, quality: 96, pricing: 90 },
      { name: 'Cotton Weavers Co.', rating: 4.5, onTime: 96, quality: 94, pricing: 88 },
      { name: 'Dye Solutions Inc.', rating: 4.2, onTime: 90, quality: 95, pricing: 85 },
      { name: 'Textile Machines Ltd.', rating: 4.7, onTime: 92, quality: 97, pricing: 82 },
      { name: 'Handloom Artisans', rating: 4.9, onTime: 86, quality: 99, pricing: 95 }
    ],
    monthlySpend: [
      { month: 'Jan', amount: 58000 },
      { month: 'Feb', amount: 62000 },
      { month: 'Mar', amount: 57000 },
      { month: 'Apr', amount: 64000 },
      { month: 'May', amount: 68000 },
      { month: 'Jun', amount: 72000 },
      { month: 'Jul', amount: 69000 },
      { month: 'Aug', amount: 75000 },
      { month: 'Sep', amount: 82000 },
      { month: 'Oct', amount: 78000 },
      { month: 'Nov', amount: 84000 },
      { month: 'Dec', amount: 79000 }
    ],
    supplierDistribution: [
      { state: 'Gujarat', count: 8 },
      { state: 'Maharashtra', count: 6 },
      { state: 'Rajasthan', count: 4 },
      { state: 'Tamil Nadu', count: 3 },
      { state: 'Karnataka', count: 2 },
      { state: 'Other', count: 1 }
    ]
  };

  // Calculate total and average metrics
  const totalSpend = metrics.monthlySpend.reduce((sum, month) => sum + month.amount, 0);
  const avgMonthlySpend = totalSpend / metrics.monthlySpend.length;
  
  // Helper for rendering bar charts (mock visualization)
  const renderBarChart = (data: { month: string; amount: number }[], height: number = 120) => {
    const max = Math.max(...data.map(item => item.amount));
    
    return (
      <div className="flex items-end h-full gap-1 pt-4">
        {data.map((item, index) => {
          const percentage = (item.amount / max) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t-sm dark:bg-blue-600" 
                style={{ height: `${percentage * height / 100}px` }}
              ></div>
              <div className="text-xs mt-2 text-gray-500">{item.month}</div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Helper for rendering donut chart (mock visualization)
  const renderDonutChart = (data: { name: string; percentage: number }[]) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-amber-500', 'bg-red-500', 'bg-cyan-500'
    ];
    
    return (
      <div className="flex justify-center items-center">
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700"></div>
          <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <PieChartIcon className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <div className="ml-8">
          {data.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm text-gray-500 ml-auto">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper for rendering heatmap (performance chart)
  const renderHeatmap = (suppliers: { name: string; rating: number; onTime: number; quality: number; pricing: number }[]) => {
    const getColor = (value: number) => {
      if (value >= 95) return 'bg-green-500';
      if (value >= 90) return 'bg-green-300';
      if (value >= 85) return 'bg-amber-300';
      if (value >= 80) return 'bg-amber-500';
      return 'bg-red-500';
    };
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Supplier</th>
              <th className="py-2 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">Rating</th>
              <th className="py-2 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">On-Time</th>
              <th className="py-2 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">Quality</th>
              <th className="py-2 px-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">Pricing</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                <td className="py-2 px-4 text-sm font-medium">{supplier.name}</td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <div className={`h-6 w-12 rounded-sm ${getColor(supplier.rating * 20)}`}></div>
                    <span className="text-xs">{supplier.rating}</span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <div className={`h-6 w-12 rounded-sm ${getColor(supplier.onTime)}`}></div>
                    <span className="text-xs">{supplier.onTime}%</span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <div className={`h-6 w-12 rounded-sm ${getColor(supplier.quality)}`}></div>
                    <span className="text-xs">{supplier.quality}%</span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <div className={`h-6 w-12 rounded-sm ${getColor(supplier.pricing)}`}></div>
                    <span className="text-xs">{supplier.pricing}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supply Chain Analytics</h1>
          <p className="text-muted-foreground">
            Gain insights into your supply chain performance and identify opportunities
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Tabs 
          value={reportType} 
          onValueChange={(value: string) => setReportType(value as any)} 
          className="flex-1"
        >
          <TabsList className="grid grid-cols-5 max-w-2xl">
            <TabsTrigger value="overview">
              <BarChartIcon className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              <Users className="h-4 w-4 mr-2" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="cost">
              <DollarSign className="h-4 w-4 mr-2" />
              Cost
            </TabsTrigger>
            <TabsTrigger value="forecast">
              <TrendingUp className="h-4 w-4 mr-2" />
              Forecast
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center">
          <span className="text-sm mr-2">Timeframe:</span>
          <div className="flex gap-2">
            <Button 
              variant={timeframe === 'monthly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('monthly')}
            >
              Monthly
            </Button>
            <Button 
              variant={timeframe === 'quarterly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('quarterly')}
            >
              Quarterly
            </Button>
            <Button 
              variant={timeframe === 'yearly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <Tabs 
          value={reportType} 
          onValueChange={(value: string) => setReportType(value as any)} 
        >
          <TabsContent value="overview" className="m-0 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders YTD</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.totalOrders}</h3>
                    <p className="text-xs text-gray-500 mt-1">Last updated today</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Spend YTD</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalSpend)}</h3>
                    <p className="text-xs text-gray-500 mt-1">Last updated today</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Delivery</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.onTimeDelivery}%</h3>
                    <p className="text-xs text-gray-500 mt-1">+2% vs. last period</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg dark:bg-amber-900/20">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Lead Time</p>
                    <h3 className="text-2xl font-bold mt-1">{metrics.avgLeadTime} days</h3>
                    <p className="text-xs text-gray-500 mt-1">-0.3 days vs. last period</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Monthly Spend</h3>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-[240px] flex items-end">
                    {renderBarChart(metrics.monthlySpend, 180)}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Total Yearly Spend</p>
                      <p className="text-xl font-bold">{formatCurrency(totalSpend)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Monthly Average</p>
                      <p className="text-xl font-bold">{formatCurrency(avgMonthlySpend)}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Spend by Category</h3>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  {renderDonutChart(metrics.topSpendCategories)}
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Top Category</p>
                        <p className="text-lg font-semibold">{metrics.topSpendCategories[0].name}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        View Detailed Report
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="suppliers" className="m-0 space-y-6">
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Supplier Performance</h3>
                  <Button variant="outline" size="sm">View All Suppliers</Button>
                </div>
              </div>
              <div className="p-6">
                {renderHeatmap(metrics.supplierPerformance)}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Top Performer</p>
                      <p className="font-medium">Handloom Artisans</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Needs Improvement</p>
                      <p className="font-medium">Dye Solutions Inc.</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="outline" size="sm" className="gap-1">
                        Performance Analysis 
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium">Supplier Distribution</h3>
                </div>
                <div className="p-6">
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg viewBox="0 0 400 200" className="w-full h-full">
                        <rect x="50" y="20" width="50" height="160" fill="#6366f1" />
                        <rect x="120" y="60" width="50" height="120" fill="#6366f1" opacity="0.8" />
                        <rect x="190" y="100" width="50" height="80" fill="#6366f1" opacity="0.6" />
                        <rect x="260" y="120" width="50" height="60" fill="#6366f1" opacity="0.4" />
                        <rect x="330" y="140" width="50" height="40" fill="#6366f1" opacity="0.2" />
                        <text x="75" y="190" fontSize="10" textAnchor="middle">Gujarat</text>
                        <text x="145" y="190" fontSize="10" textAnchor="middle">Maharashtra</text>
                        <text x="215" y="190" fontSize="10" textAnchor="middle">Rajasthan</text>
                        <text x="285" y="190" fontSize="10" textAnchor="middle">Tamil Nadu</text>
                        <text x="355" y="190" fontSize="10" textAnchor="middle">Others</text>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <div>Total suppliers: {metrics.suppliersCount}</div>
                    <div>Most concentrated: Gujarat (33%)</div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium">Supplier Risk Assessment</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">L</div>
                        <div>
                          <p className="font-medium">Low Risk</p>
                          <p className="text-sm text-gray-500">16 suppliers</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">67%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
                        <div>
                          <p className="font-medium">Medium Risk</p>
                          <p className="text-sm text-gray-500">6 suppliers</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">25%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">H</div>
                        <div>
                          <p className="font-medium">High Risk</p>
                          <p className="text-sm text-gray-500">2 suppliers</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">8%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="m-0 space-y-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <BarChartIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Orders Analysis Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  In-depth order processing metrics, lead times, and efficiency analysis would be displayed here.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cost" className="m-0 space-y-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Cost Analysis Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Detailed breakdowns of procurement costs, spending trends, and cost-saving opportunities would be displayed here.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="forecast" className="m-0 space-y-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Supply Chain Forecasting</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  AI-powered demand forecasting, inventory planning, and predictive analytics would be displayed here.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 