'use client';

import React, { useState } from 'react';
import { Card, Input, Button, Select } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  BarChart, 
  LineChart, 
  PieChart,
  ArrowDown, 
  ArrowUp, 
  Download, 
  Filter, 
  RefreshCw,
  Calendar,
  TrendingDown,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  Truck
} from 'lucide-react';

// Simple Card wrapper components to maintain the same structure
const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// Mock data for inventory metrics
const inventoryMetrics = {
  totalItems: 2478,
  totalValue: 6785000,
  lowStock: 32,
  outOfStock: 15,
  turnoverRate: 2.8,
  growth: 15.7,
  avgAge: 42, // days
  pendingOrders: 23
};

// Mock data for inventory categories
const inventoryCategories = [
  { name: 'Sarees', value: 38, color: '#3b82f6' },
  { name: 'Handloom Fabric', value: 28, color: '#10b981' },
  { name: 'Ready-to-wear', value: 15, color: '#f59e0b' },
  { name: 'Accessories', value: 12, color: '#8b5cf6' },
  { name: 'Yarn', value: 7, color: '#6b7280' }
];

// Mock data for inventory movement
const inventoryMovement = [
  { month: 'Jan', inflow: 145, outflow: 120 },
  { month: 'Feb', inflow: 167, outflow: 130 },
  { month: 'Mar', inflow: 180, outflow: 155 },
  { month: 'Apr', inflow: 210, outflow: 190 },
  { month: 'May', inflow: 175, outflow: 205 },
  { month: 'Jun', inflow: 190, outflow: 170 }
];

// Mock data for low stock items
const lowStockItems = [
  { id: 1, name: 'Mysore Silk Saree', sku: 'WM-SAR-001', quantity: 3, threshold: 5, supplier: 'Mysore Silk Weavers Association' },
  { id: 2, name: 'Karnataka Cotton Ikat Saree', sku: 'WM-SAR-005', quantity: 4, threshold: 8, supplier: 'Karnataka Handloom Development Corp.' },
  { id: 3, name: 'Organic Cotton Yarn', sku: 'WM-YRN-002', quantity: 7, threshold: 15, supplier: 'Organic Yarns India' },
  { id: 4, name: 'Natural Indigo Dye', sku: 'WM-DYE-007', quantity: 2, threshold: 5, supplier: 'Organic Dye Solutions' },
  { id: 5, name: 'Lambani Embroidery Kit', sku: 'WM-EBR-003', quantity: 8, threshold: 10, supplier: 'Lambani Craft Collective' }
];

export default function InventoryReportsPage() {
  const [dateRange, setDateRange] = useState('last30');
  const [reportType, setReportType] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate the growth indicator
  const growthIndicator = (metric: number) => {
    return metric > 0 ? (
      <div className="flex items-center text-green-600">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span>{metric}%</span>
      </div>
    ) : (
      <div className="flex items-center text-red-600">
        <TrendingDown className="h-4 w-4 mr-1" />
        <span>{Math.abs(metric)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track, analyze, and optimize your inventory performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 w-[180px]">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none w-full focus:outline-none text-sm"
              aria-label="Select date range"
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="year">This year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movement">Inventory Movement</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
          <TabsTrigger value="forecast" className="hidden lg:block">Forecasts</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Inventory Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{inventoryMetrics.totalItems}</div>
                  <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                {growthIndicator(inventoryMetrics.growth)}
                <p className="text-xs text-gray-500 mt-1">vs previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Inventory Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">${inventoryMetrics.totalValue.toLocaleString()}</div>
                  <div className="p-2 bg-green-50 rounded-full dark:bg-green-900/20">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                {growthIndicator(8.3)}
                <p className="text-xs text-gray-500 mt-1">vs previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{inventoryMetrics.lowStock + inventoryMetrics.outOfStock}</div>
                  <div className="p-2 bg-amber-50 rounded-full dark:bg-amber-900/20">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="flex space-x-4 mt-2">
                  <div>
                    <span className="text-xs text-gray-500">Low Stock</span>
                    <p className="text-sm font-medium">{inventoryMetrics.lowStock}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Out of Stock</span>
                    <p className="text-sm font-medium">{inventoryMetrics.outOfStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Turnover Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{inventoryMetrics.turnoverRate}</div>
                  <div className="p-2 bg-purple-50 rounded-full dark:bg-purple-900/20">
                    <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                {growthIndicator(2.1)}
                <p className="text-xs text-gray-500 mt-1">vs previous period</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Distribution of inventory items across categories</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full h-64 flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-500">Pie Chart Visualization</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Movement</CardTitle>
                <CardDescription>Stock inflows and outflows over time</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full h-64 flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-500">Bar Chart Visualization</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Items that need replenishment soon</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.threshold}</td>
                        <td className="px-4 py-3 text-sm">{item.supplier}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button size="sm" variant="outline">Reorder</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Tab Contents - Only showing placeholders */}
        <TabsContent value="movement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movement Details</CardTitle>
              <CardDescription>Track inflows, outflows, and transfers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <LineChart className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Line Chart Visualization</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation Analysis</CardTitle>
              <CardDescription>Cost analysis and valuation methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <DollarSign className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Valuation Chart Visualization</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts & Issues</CardTitle>
              <CardDescription>Critical alerts and action items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <AlertTriangle className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Alerts Dashboard</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Forecasts</CardTitle>
              <CardDescription>Predictive analysis and demand forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <TrendingUp className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Forecast Chart Visualization</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 