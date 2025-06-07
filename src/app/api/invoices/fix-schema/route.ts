import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated - for development, allow without session
    if (!session?.user) {
      // For development convenience, proceed without authentication
      if (process.env.NODE_ENV === 'development') {
        // Continue without authentication in development
        console.log('Proceeding without authentication in development');
      } else {
        // In production, require authentication
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Get all invoices
    const invoices = await prisma.invoice.findMany();

    console.log(`Found ${invoices.length} invoices to update`);

    // Get the first user to assign to invoices
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No users found to assign invoices' },
        { status: 400 }
      );
    }

    // Update all invoices with userId and lastUpdated
    const updatedInvoices = [];
    for (const invoice of invoices) {
      const updated = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          userId: user.id,
          lastUpdated: new Date(),
          source: 'MANUAL'
        }
      });
      updatedInvoices.push(updated.id);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedInvoices.length} invoices with missing fields`,
      invoices: updatedInvoices,
      user: user.id
    });
  } catch (error) {
    console.error('Error fixing invoices:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : 'An error occurred while fixing invoices'
      },
      { status: 500 }
    );
  }
} 