import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { stripeService } from '@/lib/stripe';
import { zohoService } from '@/lib/zoho';
import { authOptions } from '@/lib/auth';

// Schema for validating invoice creation request
const createInvoiceSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Valid email is required"),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().positive("Quantity must be positive"),
      unitPrice: z.number().positive("Unit price must be positive"),
      productSku: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
  dueDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.string()).optional(),
  syncWithInventory: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate against schema
    const validationResult = createInvoiceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;

    // Create invoice in Stripe and our database
    const invoice = await stripeService.createInvoice({
      customer: data.customer,
      items: data.items,
      dueDate: data.dueDate,
      notes: data.notes,
      customFields: data.customFields,
    });

    // If requested, sync with inventory system
    let inventorySyncResult = null;
    if (data.syncWithInventory) {
      try {
        inventorySyncResult = await zohoService.syncInvoiceItems({
          invoiceId: invoice.invoiceId,
        });
      } catch (error) {
        console.error('Error syncing with inventory:', error);
        // We'll return partial success even if inventory sync fails
        inventorySyncResult = {
          success: false,
          error: (error as Error).message,
        };
      }
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        stripeInvoiceId: invoice.stripeInvoiceId,
        pdfUrl: invoice.pdfUrl,
      },
      inventorySync: inventorySyncResult,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Check auth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // This endpoint could be used to get invoice templates or generation options
    return NextResponse.json({
      templates: [
        { id: 'default', name: 'Default Template' },
        { id: 'modern', name: 'Modern Design' },
        { id: 'minimal', name: 'Minimal Style' },
      ],
      // Could include other configuration options here
    });
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice templates' },
      { status: 500 }
    );
  }
} 