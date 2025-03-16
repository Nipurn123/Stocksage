import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for the compliance update request
const complianceSchema = z.object({
  isCompliant: z.boolean(),
  complianceNotes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Validate input
    const body = await request.json();
    const validationResult = complianceSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { isCompliant, complianceNotes } = validationResult.data;
    
    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    
    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Update the invoice compliance status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { 
        isCompliant,
        complianceNotes: complianceNotes || existingInvoice.complianceNotes,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Compliance status updated successfully',
      data: {
        id: updatedInvoice.id,
        isCompliant: updatedInvoice.isCompliant,
        complianceNotes: updatedInvoice.complianceNotes,
      },
    });
  } catch (error) {
    console.error('Error updating compliance status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred while updating compliance status' 
      },
      { status: 500 }
    );
  }
} 