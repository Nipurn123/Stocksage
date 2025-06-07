import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripeService } from '@/lib/stripe';
import { z } from 'zod';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime

// Validation schema for the invoice request
const invoiceSchema = z.object({
  // Regular invoice creation parameters
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  company: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    logo: z.string().optional(),
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
    const session = await getServerSession(authOptions);

    // Get user ID from session
    let userId = session?.user?.id;
    let isGuest = session?.user?.role === 'guest';
    
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
        isGuest = true;
      } else {
        // In production, require authentication
        return NextResponse.json(
          { success: false, error: 'Unauthorized, please sign in' }, 
          { status: 401 }
        );
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // Build query
    // Add user ID to the query if available
    const where = {
      ...(status ? { status } : {}),
      // If the database is set up with user associations, add userId filter
      // For development, provide sample data if no user-specific data exists
    };
    
    try {
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
      
      // Return real data if available
      if (invoices.length > 0) {
        return NextResponse.json({
          success: true,
          data: invoices,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          }
        }, { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      
      // For development, provide sample data if no real data is available
      if (process.env.NODE_ENV === 'development' && invoices.length === 0) {
        // Return mock invoices
        return NextResponse.json({
          success: true,
          data: getMockInvoices(isGuest, limit),
          pagination: {
            total: 10,
            page,
            limit,
            pages: Math.ceil(10 / limit),
          }
        }, { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      
      // Return empty data set
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        }
      }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    } catch (dbError) {
      console.error('Database error fetching invoices:', dbError);
      
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          data: getMockInvoices(isGuest, limit),
          pagination: {
            total: 10,
            page,
            limit,
            pages: Math.ceil(10 / limit),
          }
        }, { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch invoices'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
}

// Helper function to generate mock invoices
function getMockInvoices(isGuest: boolean, limit: number) {
  // WeaveMitra business details
  const businessName = 'WeaveMitra';
  
  // Generate sample invoices
  const invoices = [];
  const statuses = ['pending', 'paid', 'overdue', 'draft'];
  const sources = ['manual', 'scan', 'import', 'system'];
  
  // Customer data for WeaveMitra invoices
  const customers = [
    {
      name: 'Ethnic Retail Store',
      address: '42 Fashion Avenue, Commercial Street, Bangalore, Karnataka - 560001',
      email: 'orders@ethnicretail.com'
    },
    {
      name: 'Luxe Boutique',
      address: '23 Elite Plaza, MG Road, Mumbai, Maharashtra - 400001',
      email: 'procurement@luxeboutique.com'
    },
    {
      name: 'Handicraft Emporium',
      address: '78 Textile Lane, Crafts Hub, Delhi - 110001',
      email: 'purchasing@handicraftemporium.com'
    },
    {
      name: 'Cultural Artifacts',
      address: '12 Heritage Road, Artisan Quarter, Chennai, Tamil Nadu - 600001',
      email: 'procurement@culturalartifacts.in'
    },
    {
      name: 'Artisan Outlet',
      address: '45 Craft Street, Traditional Market, Kochi, Kerala - 682001',
      email: 'orders@artisanoutlet.com'
    }
  ];
  
  // Product catalog data
  const products = [
    { name: 'Mysore Silk Saree', unitPrice: 8499.99 },
    { name: 'Karnataka Cotton Ikat Saree', unitPrice: 3499.99 },
    { name: 'Ilkal Saree', unitPrice: 4299.99 },
    { name: 'Molakalmuru Saree', unitPrice: 5999.99 },
    { name: 'Udupi Cotton Fabric (per meter)', unitPrice: 549.99 },
    { name: 'Karnataka Khadi (per meter)', unitPrice: 749.99 },
    { name: 'Khadi Kurta', unitPrice: 1299.99 },
    { name: 'Lambani Embroidered Bag', unitPrice: 1299.99 },
    { name: 'Kasuti Embroidered Clutch', unitPrice: 999.99 },
    { name: 'Organic Karnataka Cotton Yarn (per kg)', unitPrice: 799.99 }
  ];
  
  for (let i = 0; i < limit; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // Generate 1-3 random items for this invoice
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const amount = product.unitPrice * quantity;
      totalAmount += amount;
      
      items.push({
        id: `item-${i}-${j}`,
        description: product.name,
        quantity: quantity,
        unitPrice: product.unitPrice,
        amount: amount,
      });
    }
    
    invoices.push({
      id: `sample-${i + 1}`,
      invoiceNumber: `${businessName}-INV-2023-${i + 100}`,
      date: date.toISOString().split('T')[0],
      dueDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      vendorName: businessName + ' Handloom Cooperative',
      vendorAddress: 'Handloom Crafts Village, Chitradurga, Karnataka - 577501',
      customerName: customer.name,
      customerAddress: customer.address,
      totalAmount: Math.round(totalAmount), // Round to nearest integer for simplicity
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      source: sources[Math.floor(Math.random() * sources.length)],
      items: items,
    });
  }
  
  return invoices;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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
        company: data.company ? {
          name: data.company.name || 'Your Company',
          address: data.company.address || '',
          email: data.company.email || '',
          phone: data.company.phone || '',
          logo: data.company.logo || '',
        } : undefined,
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

export async function PUT(request: NextRequest) {
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

    const data = await request.json();
    
    // Validate the invoice ID
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required for updates' },
        { status: 400 }
      );
    }
    
    try {
      // Instead of partial, manually validate the required fields
      if (data.invoice) {
        // If full invoice object is provided, validate critical fields
        if (!data.invoice.invoiceNumber || !data.invoice.date || !data.invoice.dueDate) {
          return NextResponse.json(
            { success: false, error: 'Invoice number, date, and due date are required' },
            { status: 400 }
          );
        }
      }
      
      // Check if invoice exists
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id: data.id },
      });
      
      if (!existingInvoice) {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        );
      }
      
      // Update the invoice - store this for consistency but no need to use it
      await prisma.invoice.update({
        where: { id: data.id },
        data: {
          // Basic invoice fields
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          dueDate: data.dueDate,
          vendorName: data.vendorName,
          vendorAddress: data.vendorAddress,
          vendorEmail: data.vendorEmail,
          vendorPhone: data.vendorPhone,
          customerName: data.customerName,
          customerAddress: data.customerAddress,
          totalAmount: data.totalAmount,
          taxAmount: data.taxAmount,
          paymentTerms: data.paymentTerms,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          status: data.status,
          
          // Handle items separately to avoid conflicts
        },
      });
      
      // If items are included, update them
      if (data.items && Array.isArray(data.items)) {
        // Delete existing items first
        await prisma.invoiceItem.deleteMany({
          where: { invoiceId: data.id },
        });
        
        // Then create the new items
        await prisma.invoiceItem.createMany({
          data: data.items.map((item: {
            description: string;
            quantity: number;
            unitPrice: number;
            amount: number;
            productSku?: string;
          }) => ({
            ...item,
            invoiceId: data.id,
          })),
        });
      }
      
      // Return the updated invoice with items
      const invoiceWithItems = await prisma.invoice.findUnique({
        where: { id: data.id },
        include: { items: true },
      });
      
      return NextResponse.json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoiceWithItems,
      });
      
    } catch (error: unknown) {
      console.error('Error updating invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return NextResponse.json(
        { success: false, error: 'Failed to update invoice', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in PUT /api/invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get the invoice ID from query parameters
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');
    
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }
    
    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    
    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Delete invoice items first
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoiceId },
    });
    
    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 