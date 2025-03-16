'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Select } from '@/components/ui';
import { 
  DollarSign, 
  PieChart, 
  BarChart4, 
  TrendingUp, 
  Plus, 
  Download, 
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import FinancialNavigation from './FinancialNavigation';

// Sample budget data
const departmentBudgets = [
  { name: 'Marketing', allocated: 120000, spent: 85000, remaining: 35000 },
  { name: 'Operations', allocated: 250000, spent: 180000, remaining: 70000 },
  { name: 'R&D', allocated: 180000, spent: 120000, remaining: 60000 },
  { name: 'Sales', allocated: 150000, spent: 130000, remaining: 20000 },
  { name: 'IT', allocated: 100000, spent: 90000, remaining: 10000 },
  { name: 'HR', allocated: 80000, spent: 60000, remaining: 20000 },
];

// Sample budget vs actual data
const budgetVsActualData = [
  { month: 'Jan', budget: 65000, actual: 68000 },
  { month: 'Feb', budget: 68000, actual: 65000 },
  { month: 'Mar', budget: 70000, actual: 72000 },
  { month: 'Apr', budget: 72000, actual: 75000 },
  { month: 'May', budget: 75000, actual: 70000 },
  { month: 'Jun', budget: 78000, actual: 80000 },
  { month: 'Jul', budget: 80000, actual: 85000 },
  { month: 'Aug', budget: 82000, actual: 88000 },
  { month: 'Sep', budget: 85000, actual: 90000 },
  { month: 'Oct', budget: 88000, actual: 92000 },
  { month: 'Nov', budget: 90000, actual: 88000 },
  { month: 'Dec', budget: 95000, actual: 98000 },
];

// Sample expense categories
const expenseCategoriesData = [
  { name: 'Salaries', value: 45 },
  { name: 'Equipment', value: 20 },
  { name: 'Marketing', value: 15 },
  { name: 'Software', value: 10 },
  { name: 'Travel', value: 5 },
  { name: 'Other', value: 5 },
];

// Sample budget alerts
const budgetAlerts = [
  { id: 1, department: 'IT', message: 'IT budget at 90% utilization', severity: 'warning', date: '2024-03-15' },
  { id: 2, department: 'Sales', message: 'Sales budget exceeding monthly allocation by 8%', severity: 'warning', date: '2024-03-12' },
  { id: 3, department: 'Marketing', message: 'Marketing budget approval required for Q2', severity: 'info', date: '2024-03-10' },
  { id: 4, department: 'R&D', message: 'R&D budget for Project X approved', severity: 'success', date: '2024-03-05' },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function BudgetingClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [fiscalYear, setFiscalYear] = useState('2024');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const fiscalYearOptions = [
    { value: '2022', label: 'FY 2022' },
    { value: '2023', label: 'FY 2023' },
    { value: '2024', label: 'FY 2024' },
    { value: '2025', label: 'FY 2025 (Planning)' },
  ];
  
  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departmentBudgets.map(dept => ({ value: dept.name.toLowerCase(), label: dept.name }))
  ];
  
  // Calculate totals
  const totalAllocated = departmentBudgets.reduce((sum, dept) => sum + dept.allocated, 0);
  const totalSpent = departmentBudgets.reduce((sum, dept) => sum + dept.spent, 0);
  const totalRemaining = departmentBudgets.reduce((sum, dept) => sum + dept.remaining, 0);
  const spentPercentage = Math.round((totalSpent / totalAllocated) * 100);
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Budget Management"
        description="Create, track, and analyze budgets across your organization"
      />
      
      <FinancialNavigation />
      
      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Select 
            options={fiscalYearOptions}
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="w-[150px]"
          />
          <Select 
            options={departmentOptions}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-[180px]"
          />
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="w-4 h-4" /> 
            More Filters
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-1">
            <Plus className="w-4 h-4" />
            New Budget
          </Button>
        </div>
      </div>
      
      {/* Budget summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalAllocated)}</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Fiscal Year {fiscalYear}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(totalSpent)}</h3>
              <span className={`${
                spentPercentage > 90 
                  ? 'text-red-600 dark:text-red-400' 
                  : spentPercentage > 75
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              } text-sm font-medium`}>
                {spentPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  spentPercentage > 90 
                    ? 'bg-red-600 dark:bg-red-500' 
                    : spentPercentage > 75
                    ? 'bg-amber-500 dark:bg-amber-400'
                    : 'bg-green-500 dark:bg-green-400'
                }`}
                style={{ width: `${spentPercentage}%` }}
              ></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalRemaining)}</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((totalRemaining / totalAllocated) * 100)}% of total budget
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Budget tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Departments</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Alerts</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Budget Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-4">Budget Allocation by Department</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentBudgets}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={value => formatCurrency(value)} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="allocated" name="Allocated" fill="#0088FE" />
                      <Bar dataKey="spent" name="Spent" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">Expense Categories</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={expenseCategoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseCategoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Department Budgets</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allocated</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {departmentBudgets.map((dept, index) => {
                    const spentPercent = Math.round((dept.spent / dept.allocated) * 100);
                    let statusColor = 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
                    
                    if (spentPercent > 90) {
                      statusColor = 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
                    } else if (spentPercent > 75) {
                      statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100';
                    }
                    
                    return (
                      <tr key={dept.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(dept.allocated)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(dept.spent)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(dept.remaining)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                            {spentPercent}% Used
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">Details</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Budget vs. Actual Spending</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={budgetVsActualData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="budget" name="Budget" stroke="#0088FE" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#FF8042" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Year-to-Date Summary</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total budget is 2.3% over planned allocation. Highest variance in Marketing (8.5% over) and IT (5.2% over).
                </p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Seasonal Patterns</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Q4 spending typically increases by 15-20%. Consider adjusting allocations for November-December.
                </p>
              </Card>
              <Card className="bg-gray-50 dark:bg-gray-800 p-4">
                <h5 className="font-medium mb-2">Forecast</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Projected to end fiscal year 3.5% over budget based on current spending patterns.
                </p>
              </Card>
            </div>
          </Card>
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Budget Alerts & Notifications</h3>
            <div className="space-y-4">
              {budgetAlerts.map((alert) => {
                let icon;
                let bgColor = 'bg-gray-50 dark:bg-gray-800';
                
                if (alert.severity === 'warning') {
                  icon = <AlertCircle className="w-5 h-5 text-amber-500" />;
                  bgColor = 'bg-amber-50 dark:bg-amber-900/20';
                } else if (alert.severity === 'success') {
                  icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                  bgColor = 'bg-green-50 dark:bg-green-900/20';
                } else {
                  icon = <Clock className="w-5 h-5 text-blue-500" />;
                  bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                }
                
                return (
                  <div key={alert.id} className={`p-4 rounded-lg ${bgColor} flex items-start`}>
                    <div className="mr-3 mt-0.5">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{alert.department}</h4>
                        <span className="text-xs text-gray-500">{alert.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-between items-center">
              <Button variant="outline" size="sm">View All Alerts</Button>
              <div className="text-sm text-gray-500">
                Showing 4 of 12 alerts
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 