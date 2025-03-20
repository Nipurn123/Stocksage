'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AppLayout from '@/components/layout/AppLayout';
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Input, Select } from '@/components/ui';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  PieChart, 
  BarChart3, 
  Plus, 
  Calendar, 
  Filter, 
  RefreshCw, 
  DownloadCloud,
  Clock,
  ArrowUpRight,
  File
} from 'lucide-react';
import { ReportData, ReportStats } from '@/types';

export default function ReportsPage() {
  const { user } = useUser();
  const isGuest = user?.publicMetadata?.role === 'guest';
  const [reports, setReports] = useState<ReportData[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [typeFilter, setTypeFilter] = useState('');

  // Fetch reports data with pagination, search, and filtering
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sortBy,
          sortDirection,
          type: typeFilter
        });
        
        const response = await fetch(`/api/reports?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setReports(data.data.items);
          setTotalPages(data.data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [page, typeFilter, sortBy, sortDirection]);

  // Fetch report stats
  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        setIsStatsLoading(true);
        const response = await fetch('/api/reports/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch report stats');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setReportStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching report stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchReportStats();
  }, []);

  // Filter reports by search term
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle pagination
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Handle type filter
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle sorting
  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortDirection('desc'); // Default to desc when changing sort field
    }
    setPage(1); // Reset to first page when sorting changes
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get report type icon
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'inventory':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'financial':
        return <PieChart className="h-4 w-4 text-purple-500" />;
      case 'customers':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get report file icon based on format
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'csv':
        return <File className="h-4 w-4 text-green-500" />;
      case 'excel':
        return <File className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and manage business reports</p>
        </div>
        <Link href="/reports/create">
          <Button variant="default" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </Link>
      </div>

      {/* Report Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  reportStats?.totalReportsGenerated || 0
                )}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most Popular</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  reportStats?.popularReports?.[0]?.type 
                    ? reportStats.popularReports[0].type.charAt(0).toUpperCase() + 
                      reportStats.popularReports[0].type.slice(1) 
                    : 'None'
                )}
              </h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent Reports</p>
              <h3 className="text-2xl font-bold mt-1">
                {isStatsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ) : (
                  reportStats?.recentReports?.length || 0
                )}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for All Reports and Report Types */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="types">Report Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                options={[
                  { value: "", label: "All Types" },
                  { value: "sales", label: "Sales" },
                  { value: "inventory", label: "Inventory" },
                  { value: "financial", label: "Financial" },
                  { value: "customers", label: "Customers" },
                  { value: "custom", label: "Custom" }
                ]}
              />

              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                options={[
                  { value: "name", label: "Name" },
                  { value: "createdAt", label: "Date Created" }
                ]}
              />

              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>

          {/* Reports Table */}
          <Card className="mb-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Report</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date Range</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Format</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Created</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    // Loading state - show skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-900">
                        <td className="px-4 py-4">
                          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredReports.length === 0 ? (
                    // Empty state
                    <tr className="bg-white dark:bg-gray-900">
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-lg font-medium">No reports found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                          <Button variant="outline" className="mt-4" onClick={() => {
                            setSearchTerm('');
                            setTypeFilter('');
                            setSortBy('createdAt');
                            setSortDirection('desc');
                          }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Report rows
                    filteredReports.map((report) => (
                      <tr 
                        key={report.id} 
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {getReportTypeIcon(report.type)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                              {report.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{report.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(report.dateRange.startDate)} - {formatDate(report.dateRange.endDate)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {getFormatIcon(report.format)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {report.format.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(report.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            {report.fileUrl ? (
                              <Button variant="outline" size="sm" className="flex items-center" asChild>
                                <a href={report.fileUrl} download>
                                  <DownloadCloud className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="flex items-center" disabled>
                                <Clock className="h-4 w-4 mr-1" />
                                Processing
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination controls */}
          {!isLoading && filteredReports.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing page {page} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="types">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isStatsLoading ? (
              // Loading state - show skeleton cards
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="ml-4">
                      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                </Card>
              ))
            ) : (
              reportStats?.availableReportTypes?.map((type) => (
                <Card key={type.type} className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-lg ${
                        type.type === 'sales' ? 'bg-green-100 dark:bg-green-900' :
                        type.type === 'inventory' ? 'bg-blue-100 dark:bg-blue-900' :
                        type.type === 'financial' ? 'bg-purple-100 dark:bg-purple-900' :
                        type.type === 'customers' ? 'bg-orange-100 dark:bg-orange-900' :
                        'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        {type.type === 'sales' ? <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" /> :
                         type.type === 'inventory' ? <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                         type.type === 'financial' ? <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                         type.type === 'customers' ? <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" /> :
                         <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <h3 className="text-lg font-semibold ml-3">{type.name}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                      {type.description}
                    </p>
                    <Link href={`/reports/create?type=${type.type}`}>
                      <Button variant="outline" className="w-full">
                        Generate Report
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

    </AppLayout>
  );
} 