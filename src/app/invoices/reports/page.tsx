'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Button, 
  Select,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DateRangePicker
} from '@/components/ui';
import { 
  FileDown, 
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function InvoiceReportsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isGuest = session?.user?.role === 'guest';
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [timeFrame, setTimeFrame] = useState('month');
  
  // Sample statistics data
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    averagePaymentTime: 0,
    invoicesByStatus: { paid: 0, pending: 0, overdue: 0 },
    invoicesByMonth: [
      { month: 'Jan', count: 0, amount: 0 },
      { month: 'Feb', count: 0, amount: 0 },
      { month: 'Mar', count: 0, amount: 0 },
      { month: 'Apr', count: 0, amount: 0 },
      { month: 'May', count: 0, amount: 0 },
      { month: 'Jun', count: 0, amount: 0 },
      { month: 'Jul', count: 0, amount: 0 },
      { month: 'Aug', count: 0, amount: 0 },
      { month: 'Sep', count: 0, amount: 0 },
      { month: 'Oct', count: 0, amount: 0 },
      { month: 'Nov', count: 0, amount: 0 },
      { month: 'Dec', count: 0, amount: 0 }
    ],
    topCustomers: [
      { name: 'Acme Corporation', count: 0, amount: 0 },
      { name: 'Globex Industries', count: 0, amount: 0 },
      { name: 'Stark Enterprises', count: 0, amount: 0 },
      { name: 'Wayne Industries', count: 0, amount: 0 },
      { name: 'Oscorp', count: 0, amount: 0 }
    ]
  });
  
  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // In a real scenario, this would be a fetch from your API
        // const response = await fetch('/api/invoices/stats');
        // const data = await response.json();
        // setStats(data);
        
        // Simulate API call with delay
        setTimeout(() => {
          // Sample data
          setStats({
            totalInvoices: 125,
            totalAmount: 287500.50,
            paidAmount: 175250.25,
            pendingAmount: 85750.00,
            overdueAmount: 26500.25,
            averagePaymentTime: 18,
            invoicesByStatus: { paid: 75, pending: 35, overdue: 15 },
            invoicesByMonth: [
              { month: 'Jan', count: 8, amount: 18500 },
              { month: 'Feb', count: 10, amount: 22750 },
              { month: 'Mar', count: 12, amount: 27500 },
              { month: 'Apr', count: 15, amount: 32250 },
              { month: 'May', count: 18, amount: 38750 },
              { month: 'Jun', count: 14, amount: 30250 },
              { month: 'Jul', count: 12, amount: 25500 },
              { month: 'Aug', count: 10, amount: 22000 },
              { month: 'Sep', count: 8, amount: 18750 },
              { month: 'Oct', count: 6, amount: 15250 },
              { month: 'Nov', count: 5, amount: 12500 },
              { month: 'Dec', count: 7, amount: 17500 }
            ],
            topCustomers: [
              { name: 'Acme Corporation', count: 15, amount: 37500 },
              { name: 'Globex Industries', count: 12, amount: 32750 },
              { name: 'Stark Enterprises', count: 10, amount: 28500 },
              { name: 'Wayne Industries', count: 8, amount: 22750 },
              { name: 'Oscorp', count: 6, amount: 18250 }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching invoice statistics:', error);
        toast.error('Failed to load invoice statistics');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [dateRange, timeFrame]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const exportReport = () => {
    // Implementation for exporting report to CSV/PDF
    toast.success('Exporting report...');
  };
  
  // Render bar chart for invoices by month
  const renderBarChart = () => {
    const maxAmount = Math.max(...stats.invoicesByMonth.map(m => m.amount));
    
    return (
      <div className="mt-4 h-64 flex items-end space-x-2">
        {stats.invoicesByMonth.map((month, index) => {
          const heightPercentage = (month.amount / maxAmount) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all cursor-pointer relative group"
                style={{ height: `${heightPercentage}%` }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatCurrency(month.amount)}
                  <br />
                  {month.count} invoices
                </div>
              </div>
              <div className="text-xs mt-2">{month.month}</div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render pie chart for invoice status
  const renderPieChart = () => {
    const total = stats.invoicesByStatus.paid + stats.invoicesByStatus.pending + stats.invoicesByStatus.overdue;
    const paidPercentage = (stats.invoicesByStatus.paid / total) * 100;
    const pendingPercentage = (stats.invoicesByStatus.pending / total) * 100;
    const overduePercentage = (stats.invoicesByStatus.overdue / total) * 100;
    
    return (
      <div className="mt-4 flex justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Paid slice */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#10B981"
              strokeWidth="20"
              strokeDasharray={`${paidPercentage * 2.51} ${100 * 2.51 - paidPercentage * 2.51}`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
            {/* Pending slice */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#FBBF24"
              strokeWidth="20"
              strokeDasharray={`${pendingPercentage * 2.51} ${100 * 2.51 - pendingPercentage * 2.51}`}
              strokeDashoffset={`${-(paidPercentage * 2.51)}`}
              transform="rotate(-90 50 50)"
            />
            {/* Overdue slice */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#EF4444"
              strokeWidth="20"
              strokeDasharray={`${overduePercentage * 2.51} ${100 * 2.51 - overduePercentage * 2.51}`}
              strokeDashoffset={`${-((paidPercentage + pendingPercentage) * 2.51)}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            {total}
          </div>
        </div>
      </div>
    );
  };
  
  // Render legend for pie chart
  const renderPieChartLegend = () => {
    return (
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">Paid ({stats.invoicesByStatus.paid})</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
          <span className="text-sm">Pending ({stats.invoicesByStatus.pending})</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">Overdue ({stats.invoicesByStatus.overdue})</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Invoice Reports</h1>
          <p className="text-gray-500">Analytics and statistics for your invoices</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportReport}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <Label htmlFor="time-frame">Time Frame</Label>
            <Select 
              id="time-frame" 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </Select>
          </div>
          
          {timeFrame === 'custom' && (
            <div className="w-full md:w-1/3">
              <Label htmlFor="date-range">Custom Date Range</Label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          )}
          
          <div className="w-full md:w-auto md:ml-auto">
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                // Simulate refresh
                setTimeout(() => {
                  setLoading(false);
                }, 1000);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mr-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalInvoices} invoices</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stats.invoicesByStatus.paid} invoices</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 mr-4">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stats.invoicesByStatus.pending} invoices</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 mr-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(stats.overdueAmount)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stats.invoicesByStatus.overdue} invoices</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Monthly Revenue</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              {renderBarChart()}
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Invoice Status</h3>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              {renderPieChart()}
              {renderPieChartLegend()}
            </Card>
          </div>
          
          {/* Top Customers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Top Customers</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.count}</TableCell>
                      <TableCell>{formatCurrency(customer.amount)}</TableCell>
                      <TableCell>{formatCurrency(customer.amount / customer.count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          
          {/* Additional Stats */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Payment Statistics</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Payment Time</p>
                <h3 className="text-2xl font-bold mt-2">{stats.averagePaymentTime} days</h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collection Rate</p>
                <h3 className="text-2xl font-bold mt-2">
                  {Math.round((stats.paidAmount / stats.totalAmount) * 100)}%
                </h3>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Rate</p>
                <h3 className="text-2xl font-bold mt-2">
                  {Math.round((stats.overdueAmount / stats.totalAmount) * 100)}%
                </h3>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
} 