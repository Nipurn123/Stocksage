import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime

// Get invoice statistics
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
    
    // Get optional date range from query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build date filter if provided
    const dateFilter = {};
    if (startDate && endDate) {
      Object.assign(dateFilter, {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      });
    }
    
    try {
      // Get counts by status
      const statusCounts = await prisma.$transaction([
        prisma.invoice.count({
          where: {
            status: 'paid',
            ...dateFilter
          }
        }),
        prisma.invoice.count({
          where: {
            status: 'pending',
            ...dateFilter
          }
        }),
        prisma.invoice.count({
          where: {
            status: 'overdue',
            ...dateFilter
          }
        }),
        prisma.invoice.count({
          where: dateFilter
        })
      ]);
      
      // Get total amount by status
      const amountsByStatus = await prisma.$transaction([
        prisma.invoice.aggregate({
          where: {
            status: 'paid',
            ...dateFilter
          },
          _sum: {
            totalAmount: true
          }
        }),
        prisma.invoice.aggregate({
          where: {
            status: 'pending',
            ...dateFilter
          },
          _sum: {
            totalAmount: true
          }
        }),
        prisma.invoice.aggregate({
          where: {
            status: 'overdue',
            ...dateFilter
          },
          _sum: {
            totalAmount: true
          }
        })
      ]);
      
      // Get invoice counts by month (for the last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // This would typically use a more complex query with groupBy
      // For simplicity, we'll just get overall counts for development
      const recentInvoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true,
          totalAmount: true,
          status: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Process monthly data (in a real app, you'd use a database aggregation)
      const monthlyData = processMonthlyData(recentInvoices);
      
      // Return statistics
      return NextResponse.json({
        success: true,
        data: {
          counts: {
            paid: statusCounts[0],
            pending: statusCounts[1],
            overdue: statusCounts[2],
            total: statusCounts[3]
          },
          amounts: {
            paid: amountsByStatus[0]._sum.totalAmount || 0,
            pending: amountsByStatus[1]._sum.totalAmount || 0,
            overdue: amountsByStatus[2]._sum.totalAmount || 0,
            total: (amountsByStatus[0]._sum.totalAmount || 0) + 
                   (amountsByStatus[1]._sum.totalAmount || 0) + 
                   (amountsByStatus[2]._sum.totalAmount || 0)
          },
          monthly: monthlyData
        }
      });
    } catch (error: unknown) {
      console.error('Error fetching invoice statistics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Database error';
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in GET /api/invoices/stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to process invoice data by month
function processMonthlyData(invoices: Array<{ 
  createdAt: Date | string; 
  totalAmount: number;
  status: string;
}>) {
  const months: Record<string, {
    count: number;
    amount: number;
    countByStatus: Record<string, number>;
  }> = {};
  
  // Process each invoice
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Initialize month data if not exists
    if (!months[monthKey]) {
      months[monthKey] = {
        count: 0,
        amount: 0,
        countByStatus: {
          paid: 0,
          pending: 0,
          overdue: 0
        }
      };
    }
    
    // Update counts and amounts
    months[monthKey].count += 1;
    months[monthKey].amount += invoice.totalAmount;
    months[monthKey].countByStatus[invoice.status] += 1;
  });
  
  // Convert to array sorted by month
  return Object.entries(months).map(([month, data]) => ({
    month,
    ...data
  })).sort((a, b) => a.month.localeCompare(b.month));
} 