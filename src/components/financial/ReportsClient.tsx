'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Select } from '@/components/ui';
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  Calendar, 
  Filter,
  ChevronDown,
  BarChart4,
  PieChart,
  ArrowDownToLine
} from 'lucide-react';
import FinancialNavigation from './FinancialNavigation';

// Report types
const reportTypes = [
  { id: 'income', name: 'Income Statement', description: 'Revenue, expenses, and profit over time', icon: <BarChart4 className="w-5 h-5" /> },
  { id: 'balance', name: 'Balance Sheet', description: 'Assets, liabilities, and equity', icon: <PieChart className="w-5 h-5" /> },
  { id: 'cashflow', name: 'Cash Flow Statement', description: 'Cash inflows and outflows', icon: <ArrowDownToLine className="w-5 h-5" /> },
  { id: 'aging', name: 'Accounts Receivable Aging', description: 'Outstanding receivables by time period', icon: <Calendar className="w-5 h-5" /> },
  { id: 'tax', name: 'Tax Reports', description: 'Tax liability and payment history', icon: <FileText className="w-5 h-5" /> },
  { id: 'custom', name: 'Custom Report', description: 'Create a customized financial report', icon: <FileText className="w-5 h-5" /> },
];

// Sample report data 
const sampleReports = [
  { id: 1, name: 'Q1 Income Statement', type: 'Income Statement', created: '2024-03-15', format: 'PDF' },
  { id: 2, name: 'Annual Balance Sheet', type: 'Balance Sheet', created: '2024-02-01', format: 'XLSX' },
  { id: 3, name: 'Monthly Cash Flow', type: 'Cash Flow Statement', created: '2024-03-01', format: 'PDF' },
  { id: 4, name: 'AR Aging Report', type: 'Accounts Receivable Aging', created: '2024-03-10', format: 'PDF' },
  { id: 5, name: 'Tax Summary 2023', type: 'Tax Reports', created: '2024-01-15', format: 'PDF' },
];

export default function ReportsClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('generate');
  const [dateRange, setDateRange] = useState('month');
  const [selectedReportType, setSelectedReportType] = useState('income');
  
  const dateOptions = [
    { value: 'month', label: 'Current Month' },
    { value: 'quarter', label: 'Current Quarter' },
    { value: 'year', label: 'Year to Date' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Period' }
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Financial Reports"
        description="Generate, download, and manage financial reports"
      />
      
      <FinancialNavigation />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Generate Reports</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Report History</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Generate Reports Tab */}
        <TabsContent value="generate">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Generate New Report</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Type
                  </label>
                  <Select 
                    options={reportTypes.map(type => ({ value: type.id, label: type.name }))}
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <Select 
                    options={dateOptions}
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start mb-3">
                  {reportTypes.find(r => r.id === selectedReportType)?.icon}
                  <div className="ml-3">
                    <h4 className="font-medium">
                      {reportTypes.find(r => r.id === selectedReportType)?.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {reportTypes.find(r => r.id === selectedReportType)?.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center">
                    <input type="checkbox" id="include-charts" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="include-charts" className="ml-2 text-sm">Include Charts</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="include-notes" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="include-notes" className="ml-2 text-sm">Include Notes</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="include-comparisons" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="include-comparisons" className="ml-2 text-sm">Year-over-Year Comparison</label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">Format:</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="px-3">PDF</Button>
                    <Button variant="outline" size="sm" className="px-3">XLSX</Button>
                    <Button variant="outline" size="sm" className="px-3">CSV</Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Report History Tab */}
        <TabsContent value="history">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Recent Reports</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {sampleReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{report.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{report.created}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 