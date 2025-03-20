import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { stripeService } from '@/lib/stripe';
import { z } from 'zod';

// Validation schema for the invoice request
const invoiceSchema = z.object({
  // Regular invoice creation parameters
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.coerce.number().positive('Quantity must be positive'),
      unitPrice: z.coerce.number().positive('Unit price must be positive'),
      productSku: z.string().optional(),
      amount: z.coerce.number().optional(),
    })
  ).optional(),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.string()).optional(),
  
  // Alternative: pass a complete invoice object (for saving scanned invoices)
  invoice: z.object({
    invoiceNumber: z.string(),
    date: z.string(),
    dueDate: z.string(),
    vendorName: z.string(),
    vendorAddress: z.string(),
    vendorEmail: z.string().optional(),
    vendorPhone: z.string().optional(),
    customerName: z.string(),
    customerAddress: z.string(),
    totalAmount: z.number(),
    taxAmount: z.number().optional(),
    items: z.array(
      z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        amount: z.number(),
      })
    ),
    paymentTerms: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
}).refine(data => data.customer || data.invoice, {
  message: "Either customer/items or a complete invoice object must be provided",
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
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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
    
    // Handle saving a scanned invoice
    if (data.invoice) {
      try {
        const { items, ...invoiceData } = data.invoice;
        
        // Save the invoice to the database
        const savedInvoice = await prisma.invoice.create({
          data: {
            ...invoiceData,
            items: {
              create: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
              })),
            },
          },
          include: {
            items: true,
          },
        });
        
        return NextResponse.json({
          success: true,
          message: 'Scanned invoice saved successfully',
          id: savedInvoice.id,
          invoiceNumber: savedInvoice.invoiceNumber,
        });
      } catch (error) {
        console.error('Error saving scanned invoice:', error);
        return NextResponse.json(
          { 
            success: false, 
            message: error instanceof Error ? error.message : 'An error occurred while saving the invoice' 
          },
          { status: 500 }
        );
      }
    }
    
    // Handle regular invoice creation
    if (data.customer && data.items) {
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
    }
    
    // This should never happen due to the schema refinement
    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid request: insufficient data provided' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling invoice request:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred while processing the invoice' 
      },
      { status: 500 }
    );
  }
} 