import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime

// Bulk route for invoice operations
export async function POST(request: NextRequest) {
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

    const { operation, invoiceIds, data } = await request.json();

    if (!operation || !invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request, missing operation or invoiceIds' },
        { status: 400 }
      );
    }

    switch (operation) {
      case 'updateStatus': {
        if (!data || !data.status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for updateStatus operation' },
            { status: 400 }
          );
        }

        // Validate status value
        const validStatuses = ['paid', 'pending', 'overdue'];
        if (!validStatuses.includes(data.status)) {
          return NextResponse.json(
            { success: false, error: 'Invalid status value' },
            { status: 400 }
          );
        }

        // Update multiple invoices' status
        const result = await prisma.invoice.updateMany({
          where: {
            id: { in: invoiceIds }
          },
          data: {
            status: data.status
          }
        });

        return NextResponse.json({
          success: true,
          message: `Updated status for ${result.count} invoices`,
          count: result.count
        });
      }

      case 'delete': {
        // First delete related invoice items
        await prisma.invoiceItem.deleteMany({
          where: {
            invoiceId: { in: invoiceIds }
          }
        });

        // Then delete the invoices
        const result = await prisma.invoice.deleteMany({
          where: {
            id: { in: invoiceIds }
          }
        });

        return NextResponse.json({
          success: true,
          message: `Deleted ${result.count} invoices`,
          count: result.count
        });
      }
      
      case 'export': {
        // Fetch invoices with their items for export
        const invoices = await prisma.invoice.findMany({
          where: {
            id: { in: invoiceIds }
          },
          include: {
            items: true
          }
        });

        // Format the data for export
        // (In a real system, you might convert this to a specific format)
        return NextResponse.json({
          success: true,
          data: invoices,
          message: `Exported ${invoices.length} invoices`
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported operation: ${operation}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('Error in bulk invoice operation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 