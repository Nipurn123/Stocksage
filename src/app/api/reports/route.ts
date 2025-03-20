import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse, ReportData } from '@/types';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    
    // Mock data - In a real app, this would come from a database
    const reportTypes = ['sales', 'inventory', 'financial', 'customers', 'custom'];
    const mockReports: ReportData[] = Array.from({ length: 25 }, (_, i) => {
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
    
    // Filter by type
    const filteredReports = type 
      ? mockReports.filter(report => report.type === type)
      : mockReports;
    
    // Sort reports
    const sortedReports = [...filteredReports].sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      // Default sort by createdAt
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = sortedReports.slice(startIndex, endIndex);
    
    // Create response
    const response: ApiResponse<PaginatedResponse<ReportData>> = {
      success: true,
      data: {
        items: paginatedReports,
        total: filteredReports.length,
        page,
        limit,
        totalPages: Math.ceil(filteredReports.length / limit),
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in reports API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type || !body.dateRange || !body.format) {
      return NextResponse.json(
        { success: false, error: 'Name, type, date range, and format are required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would generate the report and save it to the database
    const newReport: ReportData = {
      id: `report_${Date.now()}`,
      name: body.name,
      description: body.description,
      type: body.type,
      dateRange: body.dateRange,
      format: body.format,
      createdBy: 'user_1', // In real app, this would be the authenticated user's ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parameters: body.parameters,
    };
    
    return NextResponse.json({
      success: true,
      data: newReport,
      message: 'Report created successfully. It will be ready for download shortly.'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
} 