import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripeService } from '@/lib/stripe';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Find the invoice in our database
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Check if already paid
    if (invoice.paymentStatus === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'Invoice is already paid' },
        { status: 400 }
      );
    }
    
    // Process payment through Stripe if invoice has Stripe ID
    if (invoice.stripeInvoiceId) {
      await stripeService.updateInvoiceStatus(invoice.stripeInvoiceId, 'PAID');
    } else {
      // If no Stripe invoice, just update the status in our database
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { 
          paymentStatus: 'PAID',
          status: 'paid',
        },
      });
      
      // Create a payment record
      await prisma.payment.create({
        data: {
          amount: invoice.totalAmount,
          currency: 'USD',
          status: 'PAID',
          paymentMethod: 'Manual',
          invoiceId: invoice.id,
          paymentDate: new Date(),
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : 'An error occurred while processing payment'
      },
      { status: 500 }
    );
  }
} 