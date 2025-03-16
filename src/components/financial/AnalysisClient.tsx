'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import { 
  Card, 
  Button, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Select
} from '@/components/ui';
import { 
  BarChart4, 
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart as LineChartIcon,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import FinancialNavigation from './FinancialNavigation';

// Sample data for profit and loss analysis
const profitLossData = [
  { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
  { month: 'Feb', revenue: 52000, expenses: 34000, profit: 18000 },
  { month: 'Mar', revenue: 48000, expenses: 36000, profit: 12000 },
  { month: 'Apr', revenue: 58000, expenses: 35000, profit: 23000 },
  { month: 'May', revenue: 63000, expenses: 40000, profit: 23000 },
  { month: 'Jun', revenue: 59000, expenses: 42000, profit: 17000 },
  { month: 'Jul', revenue: 65000, expenses: 45000, profit: 20000 },
  { month: 'Aug', revenue: 70000, expenses: 46000, profit: 24000 },
  { month: 'Sep', revenue: 72000, expenses: 48000, profit: 24000 },
  { month: 'Oct', revenue: 68000, expenses: 44000, profit: 24000 },
  { month: 'Nov', revenue: 75000, expenses: 50000, profit: 25000 },
  { month: 'Dec', revenue: 85000, expenses: 55000, profit: 30000 },
];

// Sample data for expense breakdown
const expenseBreakdownData = [
  { name: 'Operations', value: 38 },
  { name: 'Marketing', value: 22 },
  { name: 'Payroll', value: 28 },
  { name: 'R&D', value: 10 },
  { name: 'Other', value: 2 },
];

// Sample data for revenue streams
const revenueStreamsData = [
  { name: 'Product A', value: 45 },
  { name: 'Product B', value: 25 },
  { name: 'Service X', value: 20 },
  { name: 'Service Y', value: 10 },
];

// Sample data for financial ratio trends
const ratioTrendsData = [
  { quarter: 'Q1', currentRatio: 1.8, quickRatio: 1.2, debtToEquity: 0.8, profitMargin: 20 },
  { quarter: 'Q2', currentRatio: 1.9, quickRatio: 1.3, debtToEquity: 0.75, profitMargin: 22 },
  { quarter: 'Q3', currentRatio: 2.0, quickRatio: 1.4, debtToEquity: 0.7, profitMargin: 24 },
  { quarter: 'Q4', currentRatio: 2.1, quickRatio: 1.5, debtToEquity: 0.65, profitMargin: 26 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AnalysisClient() {
  const { data: session } = useSession();
  const [timePeriod, setTimePeriod] = useState('yearly');
  const [activeTab, setActiveTab] = useState('profit-loss');
  
  const timeOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }, 
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Period' }
  ];
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Financial Analysis"
        description="Analyze financial performance, trends, and key metrics"
      />
      
      <FinancialNavigation />
      
      {/* Time period selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select 
            options={timeOptions}
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="w-[180px]"
          />
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="w-4 h-4" /> 
            Filters
          </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="w-4 h-4" /> 
          Export
        </Button>
      </div>
      
      {/* Analysis tabs */}
      <Tabs defaultValue="profit-loss" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <BarChart4 className="w-4 h-4" />
            <span className="hidden sm:inline">Profit & Loss</span>
            <span className="sm:hidden">P&L</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="ratios" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            <span>Ratios</span>
          </TabsTrigger>
        </TabsList>
        
        {/* P&L Tab */}
        <TabsContent value="profit-loss">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Profit & Loss Analysis</h3>
            <div className="flex mb-6 text-sm">
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-xl font-bold mt-1">
                    {formatCurrency(profitLossData.reduce((acc, item) => acc + item.revenue, 0))}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">Total Expenses</p>
                  <p className="text-xl font-bold mt-1">
                    {formatCurrency(profitLossData.reduce((acc, item) => acc + item.expenses, 0))}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400">Net Profit</p>
                  <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                    {formatCurrency(profitLossData.reduce((acc, item) => acc + item.profit, 0))}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profitLossData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                  <Bar dataKey="expenses" name="Expenses" fill="#FF8042" />
                  <Bar dataKey="profit" name="Profit" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Expense Breakdown</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-6">
                <h4 className="text-lg font-medium">Expense Categories</h4>
                <div className="space-y-3">
                  {expenseBreakdownData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <div className="font-medium">{item.value}%</div>
                    </div>
                  ))}
                </div>
                <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                  <h5 className="font-medium mb-2">Cost Reduction Opportunities</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Operations costs are 5% above industry average. Consider evaluating vendors and streamlining processes.
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={revenueStreamsData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueStreamsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-6">
                <h4 className="text-lg font-medium">Revenue Streams</h4>
                <div className="space-y-3">
                  {revenueStreamsData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <div className="font-medium">{item.value}%</div>
                    </div>
                  ))}
                </div>
                <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                  <h5 className="font-medium mb-2">Growth Opportunities</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Service Y shows 30% year-over-year growth with highest margins. Consider increasing marketing allocation.
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Ratios Tab */}
        <TabsContent value="ratios">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Financial Ratios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Current Ratio</p>
                <p className="text-xl font-bold mt-1">2.1</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +0.3 pts from Q1
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Quick Ratio</p>
                <p className="text-xl font-bold mt-1">1.5</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +0.3 pts from Q1
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Debt to Equity</p>
                <p className="text-xl font-bold mt-1">0.65</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  -0.15 pts from Q1
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Profit Margin</p>
                <p className="text-xl font-bold mt-1">26%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +6% pts from Q1
                </p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ratioTrendsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="currentRatio" name="Current Ratio" stroke="#0088FE" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="quickRatio" name="Quick Ratio" stroke="#00C49F" />
                  <Line type="monotone" dataKey="debtToEquity" name="Debt to Equity" stroke="#FFBB28" />
                  <Line type="monotone" dataKey="profitMargin" name="Profit Margin (%)" stroke="#FF8042" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 