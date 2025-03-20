import { NextResponse } from 'next/server';
import { ApiResponse, ReportData, ReportStats } from '@/types';

export async function GET() {
  try {
    // Mock recent reports - In a real app, this would come from a database
    const reportTypes = ['sales', 'inventory', 'financial', 'customers', 'custom'];
    const mockReports: ReportData[] = Array.from({ length: 8 }, (_, i) => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - i); // End date is i days ago
      
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 30); // Start date is 30 days before end date
      
      return {
        id: `report_${i + 1}`,
        name: `${reportTypes[i % reportTypes.length].charAt(0).toUpperCase() + reportTypes[i % reportTypes.length].slice(1)} Report ${i + 1}`,
        description: i % 3 === 0 ? `Description for report ${i + 1}` : undefined,
        type: reportTypes[i % reportTypes.length] as 'sales' | 'inventory' | 'financial' | 'customers' | 'custom',
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        format: i % 3 === 0 ? 'pdf' : i % 2 === 0 ? 'csv' : 'excel',
        createdBy: 'user_1',
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(), // Created i days ago
        updatedAt: new Date(Date.now() - (i * 43200000)).toISOString(), // Updated i/2 days ago
        fileUrl: i % 4 === 0 ? undefined : `/reports/files/report_${i + 1}.${i % 3 === 0 ? 'pdf' : i % 2 === 0 ? 'csv' : 'xlsx'}`,
      };
    });

    // Get the 5 most recent reports
    const recentReports = [...mockReports]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // Define available report types with descriptions
    const availableReportTypes = [
      {
        type: 'sales',
        name: 'Sales Reports',
        description: 'Analyze your sales data by period, product, or customer',
      },
      {
        type: 'inventory',
        name: 'Inventory Reports',
        description: 'Track stock levels, movements, and valuation',
      },
      {
        type: 'financial',
        name: 'Financial Reports',
        description: 'View income, expenses, and profit/loss statements',
      },
      {
        type: 'customers',
        name: 'Customer Reports',
        description: 'Analyze customer purchasing behavior and trends',
      },
      {
        type: 'custom',
        name: 'Custom Reports',
        description: 'Build your own reports with customizable parameters',
      },
    ];
    
    // Generate mock data for popular reports
    const popularReports = reportTypes.map(type => ({
      type,
      count: Math.floor(Math.random() * 50) + 5, // Random count between 5-55
    })).sort((a, b) => b.count - a.count);
    
    // Create response
    const reportStats: ReportStats = {
      recentReports,
      availableReportTypes,
      totalReportsGenerated: 87, // Mock total
      popularReports,
    };
    
    const response: ApiResponse<ReportStats> = {
      success: true,
      data: reportStats
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in report stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report statistics' },
      { status: 500 }
    );
  }
} 