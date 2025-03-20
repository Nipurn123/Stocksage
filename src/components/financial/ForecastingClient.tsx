'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Select } from '@/components/ui';
import { 
  TrendingUp, 
  BarChart4, 
  LineChart as LineChartIcon,
  Download, 
  Filter,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  Settings
} from 'lucide-react';
import { 
  LineChart, Line, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import FinancialNavigation from './FinancialNavigation';

// Sample revenue forecast data
const revenueForecastData = [
  { month: 'Jan', actual: 65000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Feb', actual: 68000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Mar', actual: 72000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Apr', actual: 75000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'May', actual: 78000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Jun', actual: 82000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Jul', actual: null, forecast: 85000, optimistic: 90000, pessimistic: 80000 },
  { month: 'Aug', actual: null, forecast: 88000, optimistic: 95000, pessimistic: 82000 },
  { month: 'Sep', actual: null, forecast: 92000, optimistic: 100000, pessimistic: 85000 },
  { month: 'Oct', actual: null, forecast: 95000, optimistic: 105000, pessimistic: 88000 },
  { month: 'Nov', actual: null, forecast: 98000, optimistic: 110000, pessimistic: 90000 },
  { month: 'Dec', actual: null, forecast: 105000, optimistic: 120000, pessimistic: 95000 },
];

// Sample cash flow forecast data
const cashFlowForecastData = [
  { month: 'Jan', actual: 25000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Feb', actual: 28000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Mar', actual: 30000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Apr', actual: 32000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'May', actual: 35000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Jun', actual: 38000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Jul', actual: null, forecast: 40000, optimistic: 45000, pessimistic: 35000 },
  { month: 'Aug', actual: null, forecast: 42000, optimistic: 48000, pessimistic: 38000 },
  { month: 'Sep', actual: null, forecast: 45000, optimistic: 52000, pessimistic: 40000 },
  { month: 'Oct', actual: null, forecast: 48000, optimistic: 55000, pessimistic: 42000 },
  { month: 'Nov', actual: null, forecast: 50000, optimistic: 58000, pessimistic: 45000 },
  { month: 'Dec', actual: null, forecast: 55000, optimistic: 62000, pessimistic: 48000 },
];

// Sample expense forecast data
const expenseForecastData = [
  { month: 'Jan', actual: 40000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Feb', actual: 42000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Mar', actual: 43000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Apr', actual: 45000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'May', actual: 46000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Jun', actual: 48000, forecast: null, optimistic: null, pessimistic: null },
  { month: 'Jul', actual: null, forecast: 50000, optimistic: 48000, pessimistic: 52000 },
  { month: 'Aug', actual: null, forecast: 52000, optimistic: 50000, pessimistic: 55000 },
  { month: 'Sep', actual: null, forecast: 54000, optimistic: 52000, pessimistic: 58000 },
  { month: 'Oct', actual: null, forecast: 56000, optimistic: 54000, pessimistic: 60000 },
  { month: 'Nov', actual: null, forecast: 58000, optimistic: 56000, pessimistic: 62000 },
  { month: 'Dec', actual: null, forecast: 60000, optimistic: 58000, pessimistic: 65000 },
];

// Sample growth metrics
const growthMetrics = [
  { metric: 'Revenue Growth', value: 18.5, trend: 'up', previousValue: 15.2 },
  { metric: 'Profit Margin', value: 22.3, trend: 'up', previousValue: 20.1 },
  { metric: 'Customer Acquisition', value: 12.8, trend: 'down', previousValue: 14.5 },
  { metric: 'Expense Growth', value: 8.2, trend: 'up', previousValue: 7.5 },
];

// Format currency
const formatCurrency = (value: number | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ForecastingClient() {
  const session = useSession();
  const [activeTab, setActiveTab] = useState('revenue');
  const [forecastPeriod, setForecastPeriod] = useState('6-month');
  const [showScenarios, setShowScenarios] = useState(true);
  
  const periodOptions = [
    { value: '3-month', label: '3 Months' },
    { value: '6-month', label: '6 Months' },
    { value: '12-month', label: '12 Months' },
    { value: '24-month', label: '24 Months' },
  ];
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Financial Forecasting"
        description="Predict future financial performance and make data-driven decisions"
      />
      
      <FinancialNavigation />
      
      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Select 
            options={periodOptions}
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="w-[150px]"
          />
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="w-4 h-4" /> 
            Filters
          </Button>
          <div className="flex items-center space-x-2 ml-2">
            <input 
              type="checkbox" 
              id="show-scenarios" 
              checked={showScenarios}
              onChange={() => setShowScenarios(!showScenarios)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="show-scenarios" className="text-sm">Show Scenarios</label>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Settings className="w-4 h-4" />
            Model Settings
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-1">
            <RefreshCw className="w-4 h-4" />
            Update Forecast
          </Button>
        </div>
      </div>
      
      {/* AI Insights Card */}
      <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
        <div className="flex items-start">
          <div className="mr-4 mt-1">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              AI-Powered Insights
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full">New</span>
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Based on current trends, we predict a <span className="font-medium text-green-600 dark:text-green-400">18.5% YoY revenue growth</span> by Q4 2024, exceeding industry average by 5.2%.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cash flow is projected to improve by <span className="font-medium text-green-600 dark:text-green-400">22%</span> in the next 6 months due to improved collection cycles.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-amber-600 dark:text-amber-400">Risk alert:</span> Expense growth rate is accelerating and may impact profit margins if not addressed.
              </p>
            </div>
            <div className="mt-4 flex items-center">
              <Button variant="outline" size="sm" className="gap-1">
                <Zap className="w-4 h-4" />
                Generate Recommendations
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Forecast tabs */}
      <Tabs defaultValue="revenue" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Revenue Forecast</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            <span>Cash Flow Forecast</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <BarChart4 className="w-4 h-4" />
            <span>Expense Forecast</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Revenue Forecast Tab */}
        <TabsContent value="revenue">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue Forecast</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueForecastData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <ReferenceLine x="Jun" stroke="#666" strokeDasharray="3 3" label={{ value: 'Forecast Start', position: 'top' }} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                  {showScenarios && (
                    <>
                      <Line type="monotone" dataKey="optimistic" name="Optimistic" stroke="#FFBB28" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="#FF8042" strokeDasharray="5 5" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">YTD Revenue</h5>
                <p className="text-xl font-bold">
                  {formatCurrency(revenueForecastData.filter(d => d.actual !== null).reduce((sum, item) => sum + (item.actual || 0), 0))}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +12.5% vs. Last Year
                </p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Projected EOY</h5>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    revenueForecastData.filter(d => d.actual !== null).reduce((sum, item) => sum + (item.actual || 0), 0) +
                    revenueForecastData.filter(d => d.forecast !== null).reduce((sum, item) => sum + (item.forecast || 0), 0)
                  )}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +18.5% vs. Last Year
                </p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Optimistic Case</h5>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    revenueForecastData.filter(d => d.actual !== null).reduce((sum, item) => sum + (item.actual || 0), 0) +
                    revenueForecastData.filter(d => d.optimistic !== null).reduce((sum, item) => sum + (item.optimistic || 0), 0)
                  )}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +25.2% vs. Last Year
                </p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Pessimistic Case</h5>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    revenueForecastData.filter(d => d.actual !== null).reduce((sum, item) => sum + (item.actual || 0), 0) +
                    revenueForecastData.filter(d => d.pessimistic !== null).reduce((sum, item) => sum + (item.pessimistic || 0), 0)
                  )}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  +12.8% vs. Last Year
                </p>
              </Card>
            </div>
          </Card>
        </TabsContent>
        
        {/* Cash Flow Forecast Tab */}
        <TabsContent value="cashflow">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Cash Flow Forecast</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cashFlowForecastData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <ReferenceLine x="Jun" stroke="#666" strokeDasharray="3 3" label={{ value: 'Forecast Start', position: 'top' }} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                  {showScenarios && (
                    <>
                      <Line type="monotone" dataKey="optimistic" name="Optimistic" stroke="#FFBB28" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="#FF8042" strokeDasharray="5 5" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Cash Flow Drivers</h5>
                <ul className="text-sm space-y-2 mt-2">
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-green-500" />
                    Improved accounts receivable collection (15% faster)
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-green-500" />
                    New subscription revenue model (22% of revenue)
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-amber-500" />
                    Seasonal inventory buildup in Q3
                  </li>
                </ul>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Liquidity Forecast</h5>
                <p className="text-sm mt-2">
                  Cash reserves projected to increase by 28% by year-end, providing 4.5 months of operating expenses coverage (vs. 3.2 months currently).
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                  <div 
                    className="h-2.5 rounded-full bg-green-500 dark:bg-green-400"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">75% of target achieved</p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Risk Factors</h5>
                <ul className="text-sm space-y-2 mt-2">
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-red-500" />
                    Potential supply chain disruptions (25% probability)
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-amber-500" />
                    Increased competition in primary market
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-amber-500" />
                    Rising material costs (8-12% projected increase)
                  </li>
                </ul>
              </Card>
            </div>
          </Card>
        </TabsContent>
        
        {/* Expense Forecast Tab */}
        <TabsContent value="expenses">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Expense Forecast</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={expenseForecastData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <ReferenceLine x="Jun" stroke="#666" strokeDasharray="3 3" label={{ value: 'Forecast Start', position: 'top' }} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#FF8042" fill="#FF8042" fillOpacity={0.3} />
                  {showScenarios && (
                    <>
                      <Line type="monotone" dataKey="optimistic" name="Best Case" stroke="#00C49F" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="pessimistic" name="Worst Case" stroke="#FF0000" strokeDasharray="5 5" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Expense Growth Rate</h5>
                <p className="text-xl font-bold">8.2%</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  +0.7% vs. Last Year
                </p>
                <p className="text-sm mt-2">
                  Expense growth is outpacing revenue growth in Q3, primarily due to increased marketing spend and new hires.
                </p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Cost Reduction Opportunities</h5>
                <ul className="text-sm space-y-2 mt-2">
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-green-500" />
                    Vendor consolidation: $45,000 potential savings
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-green-500" />
                    Process automation: $32,000 potential savings
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-3 h-3 mr-2 text-green-500" />
                    Energy efficiency: $18,000 potential savings
                  </li>
                </ul>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Expense Categories</h5>
                <div className="space-y-3 mt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Personnel</span>
                      <span>58%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Operations</span>
                      <span>22%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Marketing</span>
                      <span>12%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-amber-500" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Other</span>
                      <span>8%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-gray-500" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Growth Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Growth Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {growthMetrics.map((metric) => (
            <Card key={metric.metric} className="p-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{metric.metric}</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{metric.value}%</h3>
                  <span className={`${
                    metric.trend === 'up' 
                      ? metric.metric === 'Expense Growth'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-green-600 dark:text-green-400'
                      : metric.metric === 'Expense Growth'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                  } text-sm font-medium flex items-center`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
                    )}
                    {metric.trend === 'up' ? '+' : '-'}{Math.abs(metric.value - metric.previousValue).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">vs. Previous Period</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 