import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime

// Advanced search endpoint for invoices
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    // Get user ID from session
    let userId = session?.user?.id;
    
    // Check for authorization header which might contain a token from Clerk
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ') && !userId) {
      const token = authHeader.substring(7);
      // For development, use the token as a user ID if session is not available
      if (token !== 'guest-user' && process.env.NODE_ENV === 'development') {
        userId = token;
      }
    }
    
    // If no user ID is found, check if we're in development mode
    if (!userId) {
      // For development convenience, create a guest user ID
      if (process.env.NODE_ENV === 'development') {
        userId = 'guest-user-id';
      } else {
        // In production, require authentication
        return NextResponse.json(
          { success: false, error: 'Unauthorized, please sign in' }, 
          { status: 401 }
        );
      }
    }
    
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const status = searchParams.get('status');
    const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined;
    const maxAmount = searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vendor = searchParams.get('vendor');
    const invoiceNumber = searchParams.get('invoiceNumber');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build search filters
    const filters: {
      OR?: Array<{
        invoiceNumber?: { contains: string; mode: string };
        vendorName?: { contains: string; mode: string };
        customerName?: { contains: string; mode: string };
        notes?: { contains: string; mode: string };
      }>;
      status?: string;
      vendorName?: { contains: string; mode: string };
      invoiceNumber?: { contains: string; mode: string };
      totalAmount?: {
        gte?: number;
        lte?: number;
      };
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};
    
    // Text search across multiple fields
    if (query) {
      filters.OR = [
        { invoiceNumber: { contains: query, mode: 'insensitive' } },
        { vendorName: { contains: query, mode: 'insensitive' } },
        { customerName: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Apply specific filters
    if (status) {
      filters.status = status;
    }
    
    if (vendor) {
      filters.vendorName = { contains: vendor, mode: 'insensitive' };
    }
    
    if (invoiceNumber) {
      filters.invoiceNumber = { contains: invoiceNumber, mode: 'insensitive' };
    }
    
    // Amount range
    if (minAmount !== undefined || maxAmount !== undefined) {
      filters.totalAmount = {};
      
      if (minAmount !== undefined) {
        filters.totalAmount.gte = minAmount;
      }
      
      if (maxAmount !== undefined) {
        filters.totalAmount.lte = maxAmount;
      }
    }
    
    // Date range
    if (startDate || endDate) {
      filters.createdAt = {};
      
      if (startDate) {
        filters.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        filters.createdAt.lte = new Date(endDate);
      }
    }
    
    try {
      // Get total count for pagination
      const total = await prisma.invoice.count({ where: filters });
      
      // Handle sorting - validate sort field to prevent injection
      const validSortFields = ['invoiceNumber', 'date', 'dueDate', 'vendorName', 
        'customerName', 'totalAmount', 'status', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      
      // Handle sort order
      const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Execute the search
      const invoices = await prisma.invoice.findMany({
        where: filters,
        include: { 
          items: true 
        },
        orderBy: { 
          [sortField]: order 
        },
        skip,
        take: limit,
      });
      
      return NextResponse.json({
        success: true,
        data: invoices,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        filters: {
          query,
          status,
          minAmount,
          maxAmount,
          startDate,
          endDate,
          vendor,
          invoiceNumber,
          sortBy,
          sortOrder
        }
      });
    } catch (error: unknown) {
      console.error('Error searching invoices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Database error';
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in GET /api/invoices/search:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 