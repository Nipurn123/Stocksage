'use client';

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  Lightbulb,
  ArrowRight,
  FileText
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// Mock financial data
const revenueData = [
  { month: 'Jan', revenue: 82000, expenses: 68000, profit: 14000 },
  { month: 'Feb', revenue: 75000, expenses: 62000, profit: 13000 },
  { month: 'Mar', revenue: 93000, expenses: 71000, profit: 22000 },
  { month: 'Apr', revenue: 101000, expenses: 73000, profit: 28000 },
  { month: 'May', revenue: 116000, expenses: 79000, profit: 37000 },
  { month: 'Jun', revenue: 94000, expenses: 75000, profit: 19000 },
];

const categoryBreakdown = [
  { name: 'Product Line A', value: 45 },
  { name: 'Product Line B', value: 25 },
  { name: 'Product Line C', value: 15 },
  { name: 'Product Line D', value: 10 },
  { name: 'Product Line E', value: 5 },
];

const seasonalTrends = [
  { month: 'Jan', sales: 110 },
  { month: 'Feb', sales: 125 },
  { month: 'Mar', sales: 155 },
  { month: 'Apr', sales: 140 },
  { month: 'May', sales: 135 },
  { month: 'Jun', sales: 120 },
  { month: 'Jul', sales: 115 },
  { month: 'Aug', sales: 160 },
  { month: 'Sep', sales: 190 },
  { month: 'Oct', sales: 215 },
  { month: 'Nov', sales: 250 },
  { month: 'Dec', sales: 260 },
];

const topProducts = [
  { id: 1, name: 'Premium Product A', revenue: 182500, growth: 12.5 },
  { id: 2, name: 'Standard Product B', revenue: 124000, growth: 8.2 },
  { id: 3, name: 'Premium Service C', revenue: 98500, growth: 15.3 },
  { id: 4, name: 'Product Bundle D', revenue: 78000, growth: -2.7 },
  { id: 5, name: 'Value Product E', revenue: 67500, growth: 5.8 },
];

const pendingPayments = [
  { id: 'INV-4302', customer: 'Enterprise Client', amount: 28500, dueDate: '2025-04-15', status: 'Overdue', days: 5 },
  { id: 'INV-4298', customer: 'Business Solutions Inc', amount: 42000, dueDate: '2025-04-22', status: 'Upcoming', days: 2 },
  { id: 'INV-4287', customer: 'Quality Products Ltd', amount: 15500, dueDate: '2025-04-25', status: 'Upcoming', days: 5 },
  { id: 'INV-4275', customer: 'Premium Distributors', amount: 36000, dueDate: '2025-04-30', status: 'Upcoming', days: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function FinancialDashboard() {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // Calculate summary metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
  const averageProfitMargin = (totalProfit / totalRevenue) * 100;
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
  const totalPendingAmount = pendingPayments.reduce((sum, item) => sum + item.amount, 0);
  
  // Growth calculations (month-over-month)
  const lastMonthRevenue = revenueData[revenueData.length - 1].revenue;
  const previousMonthRevenue = revenueData[revenueData.length - 2].revenue;
  const revenueGrowth = ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  
  const lastMonthProfit = revenueData[revenueData.length - 1].profit;
  const previousMonthProfit = revenueData[revenueData.length - 2].profit;
  const profitGrowth = ((lastMonthProfit - previousMonthProfit) / previousMonthProfit) * 100;
  
  // AI insights based on data patterns
  const insights = [
    {
      title: "Seasonal Inventory Planning",
      description: "Based on historical data, prepare inventory for the peak season starting August, with a focus on Product Lines A and C.",
      icon: <Calendar className="h-8 w-8 p-1.5 text-orange-500 bg-orange-100 dark:bg-orange-900/30 rounded-full" />
    },
    {
      title: "Cash Flow Optimization",
      description: "Follow up on overdue payments (₹28,500) to improve your working capital for upcoming inventory purchases.",
      icon: <DollarSign className="h-8 w-8 p-1.5 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-full" />
    },
    {
      title: "Product Mix Adjustment",
      description: "Premium Service C shows 15.3% growth despite off-season. Consider increasing capacity for this offering.",
      icon: <TrendingUp className="h-8 w-8 p-1.5 text-blue-500 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-muted-foreground">
            Track your business performance and make data-driven decisions
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-2">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className={`flex items-center ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueGrowth >= 0 ? 
                <TrendingUp className="h-5 w-5 mr-1" /> : 
                <TrendingDown className="h-5 w-5 mr-1" />
              }
              <span className="font-medium">{revenueGrowth.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">vs. previous month</p>
        </Card>

        {/* Net Profit */}
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
              <h3 className="text-2xl font-bold mt-2">{formatCurrency(totalProfit)}</h3>
            </div>
            <div className={`flex items-center ${profitGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profitGrowth >= 0 ? 
                <TrendingUp className="h-5 w-5 mr-1" /> : 
                <TrendingDown className="h-5 w-5 mr-1" />
              }
              <span className="font-medium">{profitGrowth.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">vs. previous month</p>
        </Card>

        {/* Profit Margin */}
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Margin</p>
              <h3 className="text-2xl font-bold mt-2">{averageProfitMargin.toFixed(1)}%</h3>
            </div>
            <div className="flex items-center text-blue-500">
              <span className="font-medium">Industry avg: 18.2%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Industry benchmark</p>
        </Card>

        {/* Pending Payments */}
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payments</p>
              <h3 className="text-2xl font-bold mt-2">{formatCurrency(totalPendingAmount)}</h3>
            </div>
            <div className="flex items-center text-amber-500">
              <AlertCircle className="h-5 w-5 mr-1" />
              <span className="font-medium">Action Needed</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{pendingPayments.length} invoices pending</p>
        </Card>
      </div>

      {/* Revenue vs Expenses Graph */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Revenue & Expenses</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#4ade80" />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
              <Bar dataKey="profit" name="Profit" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Product Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Revenue by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm">View Detailed Breakdown</Button>
          </div>
        </Card>

        {/* Seasonal Sales Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Seasonal Sales Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={seasonalTrends}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} units`} />
                <Line type="monotone" dataKey="sales" name="Sales Index" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm">View Forecast</Button>
          </div>
        </Card>
      </div>

      {/* Top Performing Products */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 font-medium text-gray-500">Product</th>
                <th className="text-right py-3 font-medium text-gray-500">Revenue</th>
                <th className="text-right py-3 font-medium text-gray-500">Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">{product.name}</td>
                  <td className="py-3 text-right">{formatCurrency(product.revenue)}</td>
                  <td className={`py-3 text-right ${product.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <div className="flex items-center justify-end">
                      {product.growth >= 0 ? 
                        <TrendingUp className="h-4 w-4 mr-1" /> : 
                        <TrendingDown className="h-4 w-4 mr-1" />
                      }
                      {product.growth.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm">View All Products</Button>
        </div>
      </Card>

      {/* AI-Powered Insights */}
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium">AI-Powered Insights</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start mb-3">
                {insight.icon}
                <h4 className="text-md font-medium ml-3 mt-1">{insight.title}</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{insight.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm">
          <p className="text-gray-500 italic">
            Insights are generated using AI analysis of your historical data, regional market trends, and industry patterns.
          </p>
        </div>
      </Card>

      {/* Pending Payments */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pending Payments</h3>
          <Link href="/financial/receivables">
            <Button variant="link" size="sm" className="flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 font-medium text-gray-500">Invoice #</th>
                <th className="text-left py-3 font-medium text-gray-500">Customer</th>
                <th className="text-right py-3 font-medium text-gray-500">Amount</th>
                <th className="text-right py-3 font-medium text-gray-500">Due Date</th>
                <th className="text-right py-3 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      {payment.id}
                    </div>
                  </td>
                  <td className="py-3">{payment.customer}</td>
                  <td className="py-3 text-right">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 text-right">{new Date(payment.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'Overdue' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {payment.status} {payment.status === 'Overdue' ? `(${payment.days} days)` : `(in ${payment.days} days)`}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="outline" size="sm">Send Reminder</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 