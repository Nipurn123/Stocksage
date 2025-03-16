import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { stripeService } from '@/lib/stripe';
import { z } from 'zod';

// Validation schema for the invoice request
const invoiceSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.coerce.number().positive('Quantity must be positive'),
      unitPrice: z.coerce.number().positive('Unit price must be positive'),
      productSku: z.string().optional(),
    })
  ).min(1, 'At least one item is required'),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // Build query
    const where = status ? { status } : {};
    
    // Get total count for pagination
    const total = await prisma.invoice.count({ where });
    
    // Fetch invoices with their items
    const invoices = await prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    
    // Return response
    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch invoices'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = invoiceSchema.safeParse(body);
    
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
    
    const data = validationResult.data;
    
    // Create the invoice using the stripe service
    const invoice = await stripeService.createInvoice({
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        address: data.customer.address,
        phone: data.customer.phone,
      },
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        productSku: item.productSku,
      })),
      dueDate: data.dueDate,
      notes: data.notes,
      customFields: data.customFields,
    });

    // Update the inventory if needed (Zoho integration would go here)
    // This would be handled by a separate service
    
    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl: invoice.pdfUrl,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred while creating the invoice' 
      },
      { status: 500 }
    );
  }
} 