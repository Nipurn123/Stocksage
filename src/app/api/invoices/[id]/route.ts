import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated - for development, allow without session
    if (!session?.user) {
      // For development convenience, proceed without authentication
      if (process.env.NODE_ENV === 'development') {
        // Continue without authentication in development
      } else {
        // In production, require authentication
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Ensure params.id is valid
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const invoiceId = params.id;
    
    // Find invoice with its related items
    const invoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
      },
      include: {
        items: true,
        customer: true,
      },
    });
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Ensure we have vendor information (in case it's missing for some invoices)
    // This helps with displaying the invoice in the UI
    const invoiceWithDefaults = {
      ...invoice,
      // Set default vendor information if not already set
      vendorName: invoice.vendorName || "Your Company Name",
      vendorAddress: invoice.vendorAddress || "Your Company Address",
      vendorEmail: invoice.vendorEmail || "contact@example.com",
      vendorPhone: invoice.vendorPhone || "(123) 456-7890"
    };
    
    return NextResponse.json({
      success: true,
      data: invoiceWithDefaults,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : 'An error occurred while fetching invoice'
      },
      { status: 500 }
    );
  }
} 