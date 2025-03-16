'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingDown, 
  DollarSign, 
  PlusCircle, 
  Download,
  Filter,
  FileText,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function CostAnalysisPage() {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [costView, setCostView] = useState<'overview' | 'categories' | 'trends' | 'optimization'>('overview');
  
  // Mock data for cost analysis
  const costData = {
    totalCosts: 325680,
    variableCosts: 185400,
    fixedCosts: 140280,
    costOfGoodsSold: 155200,
    operatingExpenses: 170480,
    costReductionOpportunities: 48250,
    monthlyTrend: [
      { month: 'Jan', costs: 24000 },
      { month: 'Feb', costs: 25500 },
      { month: 'Mar', costs: 27300 },
      { month: 'Apr', costs: 26800 },
      { month: 'May', costs: 28500 },
      { month: 'Jun', costs: 29200 },
      { month: 'Jul', costs: 27600 },
      { month: 'Aug', costs: 26400 },
      { month: 'Sep', costs: 27100 },
      { month: 'Oct', costs: 28700 },
      { month: 'Nov', costs: 26900 },
      { month: 'Dec', costs: 27680 }
    ],
    costBreakdown: [
      { name: 'Raw Materials', value: 78200, color: '#4ADE80' },
      { name: 'Labor', value: 64800, color: '#3B82F6' },
      { name: 'Overhead', value: 42500, color: '#EC4899' },
      { name: 'Administration', value: 55680, color: '#FACC15' },
      { name: 'Marketing', value: 38000, color: '#FB923C' },
      { name: 'Logistics', value: 46500, color: '#8B5CF6' }
    ],
    costSavingOpportunities: [
      { name: 'Supplier Negotiation', value: 18500, difficulty: 'Medium' },
      { name: 'Process Optimization', value: 12700, difficulty: 'Hard' },
      { name: 'Energy Efficiency', value: 8600, difficulty: 'Easy' },
      { name: 'Inventory Management', value: 5200, difficulty: 'Medium' },
      { name: 'Waste Reduction', value: 3250, difficulty: 'Easy' }
    ],
    costPerformance: [
      { category: 'Raw Materials', target: 75000, actual: 78200, variance: 3200 },
      { category: 'Labor', target: 60000, actual: 64800, variance: 4800 },
      { category: 'Overhead', target: 45000, actual: 42500, variance: -2500 },
      { category: 'Administration', target: 50000, actual: 55680, variance: 5680 },
      { category: 'Marketing', target: 40000, actual: 38000, variance: -2000 },
      { category: 'Logistics', target: 42000, actual: 46500, variance: 4500 }
    ]
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cost Analysis" 
        description="Analyze your cost structure, identify trends, and find cost-saving opportunities"
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          value={costView} 
          onValueChange={(value: string) => setCostView(value as any)} 
          className="flex-1"
        >
          <TabsList className="grid grid-cols-4 max-w-lg">
            <TabsTrigger value="overview">
              <DollarSign className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="trends">
              <BarChartIcon className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <TrendingDown className="h-4 w-4 mr-2" />
              Optimization
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Cost Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Costs YTD</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(costData.totalCosts)}</h3>
                    <p className="text-xs text-gray-500 mt-1">+5.2% vs last year</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cost of Goods Sold</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(costData.costOfGoodsSold)}</h3>
                    <p className="text-xs text-gray-500 mt-1">47.6% of total costs</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Operating Expenses</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(costData.operatingExpenses)}</h3>
                    <p className="text-xs text-gray-500 mt-1">52.4% of total costs</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg dark:bg-amber-900/20">
                    <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Savings Opportunities</p>
                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(costData.costReductionOpportunities)}</h3>
                    <p className="text-xs text-gray-500 mt-1">14.8% potential savings</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <TrendingDown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Cost Structure Chart */}
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-medium">Cost Structure Breakdown</h3>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData.costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={1}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      >
                        {costData.costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  {costData.costBreakdown.map((entry, index) => (
                    <div key={index} className="flex items-center mr-6">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6 space-y-6">
            {/* Cost Categories Analysis */}
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-medium">Cost Categories Performance</h3>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costData.costPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar name="Target" dataKey="target" fill="#3B82F6" />
                      <Bar name="Actual" dataKey="actual" fill="#FB923C" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium">Fixed vs Variable Costs</h3>
                </div>
                <div className="p-6">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fixed Costs', value: costData.fixedCosts, color: '#3B82F6' },
                            { name: 'Variable Costs', value: costData.variableCosts, color: '#FB923C' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#3B82F6" />
                          <Cell fill="#FB923C" />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Fixed Costs</p>
                      <p className="text-xl font-semibold">{formatCurrency(costData.fixedCosts)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Variable Costs</p>
                      <p className="text-xl font-semibold">{formatCurrency(costData.variableCosts)}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium">Budget Variances</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {costData.costPerformance.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className={`text-sm font-medium ${
                            item.variance > 0 ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className={`h-2.5 rounded-full ${
                              item.variance > 0 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(Math.abs(item.variance) / item.target * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6 space-y-6">
            {/* Cost Trend Analysis */}
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-medium">Monthly Cost Trend</h3>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={costData.monthlyTrend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Area 
                        type="monotone" 
                        dataKey="costs" 
                        stroke="#3B82F6" 
                        fill="#93C5FD" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">Average Monthly</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(
                        costData.monthlyTrend.reduce((sum, item) => sum + item.costs, 0) / 
                        costData.monthlyTrend.length
                      )}
                    </p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">Highest Month</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(Math.max(...costData.monthlyTrend.map(item => item.costs)))}
                    </p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">Lowest Month</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(Math.min(...costData.monthlyTrend.map(item => item.costs)))}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="flex items-center gap-4 justify-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter Options
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="optimization" className="mt-6 space-y-6">
            {/* Cost Optimization Opportunities */}
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-medium">Cost-Saving Opportunities</h3>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={costData.costSavingOpportunities}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar 
                        dataKey="value" 
                        fill="#8B5CF6" 
                        name="Potential Savings" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {costData.costSavingOpportunities.map((opportunity, index) => (
                <Card key={index} className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                      <div 
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          opportunity.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : opportunity.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {opportunity.difficulty}
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2">{formatCurrency(opportunity.value)}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Potential annual savings by optimizing this area.
                    </p>
                    <Button className="mt-auto" variant="outline">
                      View Action Plan
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-blue-600 dark:text-blue-400 h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Total Optimization Potential</h3>
                  <p className="text-sm mb-4">
                    Implementing all recommended cost optimizations could reduce your annual costs by up to {formatCurrency(costData.costReductionOpportunities)} (14.8%).
                  </p>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Optimization Plan
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 