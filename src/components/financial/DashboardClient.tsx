'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PageHeader from '@/components/ui/PageHeader';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Select } from '@/components/ui';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Calendar, 
  BarChart4, 
  CreditCard,
  TrendingUp,
  Clock,
  FileText,
  Download,
  ExternalLink,
  PieChart,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart, TooltipProps 
} from 'recharts';
import FinancialNavigation from './FinancialNavigation';

// Mock data for the charts
const cashFlowData = [
  { name: 'Jan', income: 4000, expenses: 2400, balance: 1600 },
  { name: 'Feb', income: 3000, expenses: 1398, balance: 1602 },
  { name: 'Mar', income: 2000, expenses: 9800, balance: -7800 },
  { name: 'Apr', income: 2780, expenses: 3908, balance: -1128 },
  { name: 'May', income: 1890, expenses: 4800, balance: -2910 },
  { name: 'Jun', income: 2390, expenses: 3800, balance: -1410 },
  { name: 'Jul', income: 3490, expenses: 4300, balance: -810 },
  { name: 'Aug', income: 5000, expenses: 3000, balance: 2000 },
  { name: 'Sep', income: 6000, expenses: 2000, balance: 4000 },
  { name: 'Oct', income: 7000, expenses: 2500, balance: 4500 },
  { name: 'Nov', income: 5500, expenses: 2800, balance: 2700 },
  { name: 'Dec', income: 6500, expenses: 3500, balance: 3000 },
];

const receivablesData = [
  { name: 'Current', value: 4000, color: '#4ADE80' },
  { name: '1-30 days', value: 3000, color: '#FACC15' },
  { name: '31-60 days', value: 2000, color: '#FB923C' },
  { name: '61-90 days', value: 1500, color: '#F87171' },
  { name: '>90 days', value: 1000, color: '#EF4444' },
];

const revenueData = [
  { month: 'Jan', thisYear: 4000, lastYear: 3000 },
  { month: 'Feb', thisYear: 5000, lastYear: 4000 },
  { month: 'Mar', thisYear: 6000, lastYear: 5500 },
  { month: 'Apr', thisYear: 7000, lastYear: 6000 },
  { month: 'May', thisYear: 8000, lastYear: 7000 },
  { month: 'Jun', thisYear: 9000, lastYear: 8000 },
  { month: 'Jul', thisYear: 10000, lastYear: 9000 },
  { month: 'Aug', thisYear: 11000, lastYear: 10000 },
  { month: 'Sep', thisYear: 12000, lastYear: 11000 },
  { month: 'Oct', thisYear: 13000, lastYear: 12000 },
  { month: 'Nov', thisYear: 14000, lastYear: 13000 },
  { month: 'Dec', thisYear: 15000, lastYear: 14000 },
];

const paymentCycleData = [
  { name: '0-7 days', percentage: 15 },
  { name: '8-14 days', percentage: 25 },
  { name: '15-30 days', percentage: 40 },
  { name: '31-45 days', percentage: 15 },
  { name: '>45 days', percentage: 5 },
];

const upcomingPayments = [
  { id: 'inv-1001', customer: 'Acme Corp', amount: 2500, dueDate: '2023-12-15', status: 'upcoming' },
  { id: 'inv-1002', customer: 'TechGiant Inc', amount: 3500, dueDate: '2023-12-20', status: 'upcoming' },
  { id: 'inv-1003', customer: 'Mega Industries', amount: 1200, dueDate: '2023-12-22', status: 'upcoming' },
  { id: 'inv-1004', customer: 'Small Business LLC', amount: 800, dueDate: '2023-12-25', status: 'upcoming' },
  { id: 'inv-1005', customer: 'Medium Enterprises', amount: 1500, dueDate: '2023-12-30', status: 'upcoming' },
];

const invoiceStatusData = [
  { name: 'Paid', value: 68 },
  { name: 'Pending', value: 21 },
  { name: 'Overdue', value: 11 },
];

const COLORS = ['#10b981', '#3b82f6', '#f97316', '#ef4444'];

const recentTransactions = [
  { id: 1, customer: 'Acme Corp', amount: 2450.00, status: 'completed', date: '2024-06-10' },
  { id: 2, customer: 'Globex Inc', amount: 1850.75, status: 'pending', date: '2024-06-08' },
  { id: 3, customer: 'Wayne Enterprises', amount: 3200.00, status: 'completed', date: '2024-06-05' },
  { id: 4, customer: 'Stark Industries', amount: 780.50, status: 'failed', date: '2024-06-03' },
  { id: 5, customer: 'Umbrella Corp', amount: 1200.00, status: 'completed', date: '2024-06-01' },
];

// Format percentage function
const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export default function DashboardClient() {
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');
  const [focusTab, setFocusTab] = useState('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'bar' | 'line' | 'area'>('area');
  const [showAiInsights, setShowAiInsights] = useState(true);
  
  // Custom formatter for currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Determine if cash flow is positive or negative
  const netCashFlow = cashFlowData.reduce((sum, item) => sum + item.balance, 0);
  const cashFlowStatus = netCashFlow >= 0 ? 'positive' : 'negative';

  // Calculate financial metrics from data
  const totalIncome = cashFlowData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = cashFlowData.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = (netProfit / totalIncome) * 100;
  
  // Calculate receivables total
  const totalReceivables = receivablesData.reduce((sum, item) => sum + item.value, 0);
  const overdueReceivables = receivablesData
    .filter(item => item.name !== 'Current')
    .reduce((sum, item) => sum + item.value, 0);

  // Calculate year-over-year growth
  const yearOverYearGrowth = 
    (revenueData[revenueData.length - 1].thisYear - revenueData[revenueData.length - 1].lastYear) / 
    revenueData[revenueData.length - 1].lastYear * 100;

  // Format dates to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // NEW: AI-generated financial insights based on the data
  const aiInsights = [
    {
      id: 1,
      title: "Cash Flow Trend",
      description: "Your cash flow has shown improvement in the last quarter with a 14% increase in positive balance.",
      type: "positive",
      actionable: "Consider allocating 20% of the surplus to your emergency fund."
    },
    {
      id: 2,
      title: "Receivables Management",
      description: "31.5% of your receivables are currently overdue, which is 5% higher than industry average.",
      type: "warning",
      actionable: "Review your credit terms and implement automated payment reminders."
    },
    {
      id: 3,
      title: "Expense Analysis",
      description: "Marketing expenses increased by 15% but resulted in only 8% revenue growth.",
      type: "negative",
      actionable: "Evaluate marketing campaign ROI and reallocate budget to higher-performing channels."
    },
    {
      id: 4,
      title: "Cost Optimization",
      description: "Your operational expenses are 12% lower than similar businesses in your industry.",
      type: "positive",
      actionable: "Document your cost-saving measures for future reference."
    }
  ];

  // NEW: Projected cash flow for next 3 months
  const projectedCashFlow = [
    { month: 'Current', income: 42000, expenses: 35000, balance: 7000 },
    { month: 'Next Month', income: 45000, expenses: 36000, balance: 9000 },
    { month: 'In 2 Months', income: 47500, expenses: 37500, balance: 10000 },
    { month: 'In 3 Months', income: 50000, expenses: 38000, balance: 12000 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Financial Dashboard"
        description="Analyze your financial data and track cash flow"
      />
      
      <FinancialNavigation />
      
      {/* Top stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue (YTD)</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(totalIncome)}</h3>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {yearOverYearGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">vs Last Year</span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(totalIncome - (totalIncome / (1 + yearOverYearGrowth / 100)))}
              </span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Expenses (YTD)</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(totalExpenses)}</h3>
              <span className={`${
                totalExpenses > totalIncome * 0.8 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-400'
              } text-sm font-medium`}>
                {formatPercentage(totalExpenses / totalIncome * 100)} of revenue
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Major category:</span>
              <span className="text-xs font-medium">Operations (38%)</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(netProfit)}</h3>
              <span className={`${
                profitMargin > 20 
                  ? 'text-green-600 dark:text-green-400' 
                  : profitMargin > 10
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              } text-sm font-medium flex items-center`}>
                {profitMargin.toFixed(1)}% margin
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Industry avg:</span>
              <span className="text-xs font-medium">18.5%</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Accounts Receivable</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(totalReceivables)}</h3>
              <span className={`${
                overdueReceivables / totalReceivables > 0.3
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              } text-sm font-medium`}>
                {formatPercentage(overdueReceivables / totalReceivables * 100)} overdue
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">30+ days:</span>
              <span className="text-xs font-medium">{formatCurrency(
                receivablesData.filter(item => item.name !== 'Current' && item.name !== '1-30 days')
                  .reduce((sum, item) => sum + item.value, 0)
              )}</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* NEW: AI Financial Insights */}
      {showAiInsights && (
        <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <BarChart4 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold">AI-Powered Financial Insights</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAiInsights(false)}>
              Hide
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map(insight => (
              <div 
                key={insight.id} 
                className={`p-4 rounded-lg border ${
                  insight.type === 'positive' 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' 
                    : insight.type === 'warning'
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                }`}
              >
                <h4 className="font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{insight.description}</p>
                <div className="text-sm font-medium">
                  <span className="text-gray-600 dark:text-gray-300">Recommendation: </span>
                  <span className={`${
                    insight.type === 'positive' 
                      ? 'text-green-700 dark:text-green-400' 
                      : insight.type === 'warning'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {insight.actionable}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Analysis
            </Button>
          </div>
        </Card>
      )}
      
      {/* Main charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-lg font-medium">Cash Flow</h3>
            <div className="flex items-center gap-2">
              <div className="flex">
                <Button 
                  variant={chartView === 'bar' ? 'default' : 'outline'} 
                  size="sm" 
                  className="rounded-r-none"
                  onClick={() => setChartView('bar')}
                >
                  Bar
                </Button>
                <Button 
                  variant={chartView === 'line' ? 'default' : 'outline'} 
                  size="sm" 
                  className="rounded-none border-l-0 border-r-0"
                  onClick={() => setChartView('line')}
                >
                  Line
                </Button>
                <Button 
                  variant={chartView === 'area' ? 'default' : 'outline'} 
                  size="sm" 
                  className="rounded-l-none"
                  onClick={() => setChartView('area')}
                >
                  Area
                </Button>
              </div>
              <Select 
                options={[
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                  { value: 'quarter', label: 'Quarter' },
                  { value: 'year', label: 'Year' }
                ]}
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value as any)}
              />
            </div>
          </div>
          <div className="p-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'bar' ? (
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar name="Income" dataKey="income" fill="#4ADE80" />
                    <Bar name="Expenses" dataKey="expenses" fill="#F87171" />
                    <Bar name="Balance" dataKey="balance" fill="#60A5FA" />
                  </BarChart>
                ) : chartView === 'line' ? (
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line name="Income" type="monotone" dataKey="income" stroke="#4ADE80" activeDot={{ r: 8 }} />
                    <Line name="Expenses" type="monotone" dataKey="expenses" stroke="#F87171" />
                    <Line name="Balance" type="monotone" dataKey="balance" stroke="#60A5FA" />
                  </LineChart>
                ) : (
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Area name="Income" type="monotone" dataKey="income" stackId="1" stroke="#4ADE80" fill="#86EFAC" />
                    <Area name="Expenses" type="monotone" dataKey="expenses" stackId="2" stroke="#F87171" fill="#FCA5A5" />
                    <Area name="Balance" type="monotone" dataKey="balance" stroke="#60A5FA" fill="#93C5FD" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium">Accounts Receivable Aging</h3>
          </div>
          <div className="p-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={receivablesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {receivablesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, undefined]} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {receivablesData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link href="/financial/customers" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Manage Receivables
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* NEW: Cash Flow Projection */}
      <Card>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium">Cash Flow Projection</h3>
        </div>
        <div className="p-6">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectedCashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar name="Projected Income" dataKey="income" fill="#4ADE80" />
                <Bar name="Projected Expenses" dataKey="expenses" fill="#F87171" />
                <Line name="Net Cash Flow" type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} dot={{ r: 6 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projection Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on historical data and current trends, your cash flow is projected to 
                <span className="text-green-600 dark:text-green-400 font-medium"> improve by 71%</span> over the next 3 months.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Projection
              </Button>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Run Scenario Analysis
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick actions and links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/financial/automated-invoicing">
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-300" />
                <h4 className="font-medium mb-1">Create Invoice</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate and send invoices to customers</p>
              </div>
            </Link>
            
            <Link href="/financial/cost-analysis">
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mb-2 group-hover:text-green-500 dark:group-hover:text-green-300" />
                <h4 className="font-medium mb-1">Cost Analysis</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analyze costs and find optimization opportunities</p>
              </div>
            </Link>
            
            <Link href="/financial/customers">
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-500 dark:group-hover:text-purple-300" />
                <h4 className="font-medium mb-1">Customer Accounts</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer information and accounts</p>
              </div>
            </Link>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Reports</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Q4 Financial Statement</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Generated on Jan 15, 2023</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button size="sm" variant="outline" className="h-7 px-2 py-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 py-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Annual Tax Report</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Generated on Feb 2, 2023</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button size="sm" variant="outline" className="h-7 px-2 py-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Cash Flow Analysis</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Generated on Feb 28, 2023</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button size="sm" variant="outline" className="h-7 px-2 py-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 py-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link href="/financial/reports" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
              <ExternalLink className="w-4 h-4 mr-1" />
              View All Financial Reports
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 