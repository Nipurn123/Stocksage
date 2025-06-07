import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Detect if we're in a build context
const isBuildProcess = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production';

// Mock logs for build-time
const mockLogs = [
  { 
    id: 'log-1', 
    productId: 'prod-1', 
    quantity: 10, 
    quantityChange: 10,
    type: 'in', 
    reference: 'Purchase Order #123', 
    notes: 'Restocking inventory', 
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    product: { name: 'Silk Saree', sku: 'SAR-123' }
  },
  { 
    id: 'log-2', 
    productId: 'prod-1', 
    quantity: 8, 
    quantityChange: -2,
    type: 'out', 
    reference: 'Sale #456', 
    notes: 'Customer order', 
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    product: { name: 'Silk Saree', sku: 'SAR-123' }
  },
  { 
    id: 'log-3', 
    productId: 'prod-2', 
    quantity: 15, 
    quantityChange: 15,
    type: 'in', 
    reference: 'Initial Stock', 
    notes: 'Setup inventory', 
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    product: { name: 'Cotton Fabric', sku: 'FAB-101' }
  }
];

// GET endpoint to fetch all inventory logs with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get user session and check if user is authenticated
    const session = await getServerSession(authOptions);
    const authHeader = request.headers.get('Authorization');
    
    // Extract userId from session or auth header (for guest users in dev mode)
    let userId = session?.user?.id;
    
    // Handle Authorization header for non-session auth (e.g., from client-side)
    if (!userId && authHeader) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined') {
        if (token === 'guest-user' && process.env.NODE_ENV === 'development') {
          // Allow guest user in dev mode
          userId = 'guest-user';
        } else {
          // For non-dev environments, we would validate the token here
          // This is a simplified example
          userId = token;
        }
      }
    }
    
    // If no user ID is found, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access inventory logs.' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build the query criteria
    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (type && (type === 'in' || type === 'out')) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    // During build time or if we need to return mock data
    if (process.env.NODE_ENV === 'development' && userId === 'guest-user') {
      return NextResponse.json(
        { 
          logs: getMockInventoryLogs(),
          message: 'Using sample data for development' 
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Fetch the logs from the database
    const logs = await prisma.inventoryLog.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(
      { logs },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    
    // In development mode, return mock data on error
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          logs: getMockInventoryLogs(),
          error: 'An error occurred while fetching logs. Displaying sample data.',
          dev: true
        },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while fetching inventory logs.' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// POST endpoint to create a new inventory log
export async function POST(request: NextRequest) {
  try {
    // Get user session and check if user is authenticated
    const session = await getServerSession(authOptions);
    const authHeader = request.headers.get('Authorization');
    
    // Extract userId from session or auth header
    let userId = session?.user?.id;
    
    // Handle Authorization header for non-session auth
    if (!userId && authHeader) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined') {
        if (token === 'guest-user' && process.env.NODE_ENV === 'development') {
          // Allow guest user in dev mode
          userId = 'guest-user';
        } else {
          // For non-dev environments, validate the token
          userId = token;
        }
      }
    }
    
    // If no user ID is found, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to create inventory logs.' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Parse and validate the request body
    const body = await request.json();
    
    // Schema validation
    const schema = z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      type: z.enum(['in', 'out']),
      reference: z.string().optional(),
      invoiceId: z.string().optional(),
      notes: z.string().optional(),
    });
    
    const validatedData = schema.parse(body);
    
    // Mock data mode for development
    if (process.env.NODE_ENV === 'development' && userId === 'guest-user') {
      return NextResponse.json(
        { 
          message: 'Inventory log created successfully (mock)',
          log: {
            id: 'mock-log-' + Date.now(),
            ...validatedData,
            createdAt: new Date(),
            createdBy: userId,
          } 
        },
        { 
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Create the inventory log and update product stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the current product
      const product = await tx.product.findUnique({
        where: { id: validatedData.productId },
      });
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Calculate the new stock level
      let newStockLevel = product.currentStock;
      
      if (validatedData.type === 'in') {
        newStockLevel += validatedData.quantity;
      } else {
        newStockLevel -= validatedData.quantity;
        
        if (newStockLevel < 0) {
          throw new Error('Insufficient stock available');
        }
      }
      
      // Update the product stock
      await tx.product.update({
        where: { id: validatedData.productId },
        data: { currentStock: newStockLevel },
      });
      
      // Create the inventory log
      const log = await tx.inventoryLog.create({
        data: {
          productId: validatedData.productId,
          quantity: newStockLevel, // Current quantity after change
          quantityChange: validatedData.quantity, // Amount changed
          type: validatedData.type,
          reference: validatedData.reference || '',
          invoiceId: validatedData.invoiceId,
          notes: validatedData.notes || '',
          createdBy: userId as string,
        },
      });
      
      return { log, product };
    });
    
    return NextResponse.json(
      { message: 'Inventory log created successfully', log: result.log },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error creating inventory log:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { error: 'Product not found' },
          { 
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      if (error.message === 'Insufficient stock available') {
        return NextResponse.json(
          { error: 'Insufficient stock available' },
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'An error occurred while creating the inventory log' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Helper function to generate mock inventory logs for development
function getMockInventoryLogs() {
  return [
    {
      id: 'mock-log-1',
      productId: 'product-1',
      product: {
        id: 'product-1',
        name: 'Wireless Headphones',
        sku: 'WH-001',
      },
      quantity: 120,
      quantityChange: 20,
      type: 'in',
      reference: 'PO-12345',
      notes: 'Restocked from supplier',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-log-2',
      productId: 'product-2',
      product: {
        id: 'product-2',
        name: 'Bluetooth Speaker',
        sku: 'BS-002',
      },
      quantity: 45,
      quantityChange: 5,
      type: 'out',
      reference: 'INV-6789',
      invoiceId: 'invoice-1',
      notes: 'Order #6789',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-log-3',
      productId: 'product-3',
      product: {
        id: 'product-3',
        name: 'Smartphone Case',
        sku: 'SC-003',
      },
      quantity: 200,
      quantityChange: 50,
      type: 'in',
      reference: 'PO-67890',
      notes: 'New shipment arrival',
      createdBy: 'user-1',
      createdAt: new Date(),
    },
    {
      id: 'mock-log-4',
      productId: 'product-4',
      product: {
        id: 'product-4',
        name: 'USB-C Cable',
        sku: 'UC-004',
      },
      quantity: 85,
      quantityChange: 15,
      type: 'out',
      reference: 'INV-1234',
      invoiceId: 'invoice-2',
      notes: 'Bulk order for office supplies',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'mock-log-5',
      productId: 'product-5',
      product: {
        id: 'product-5',
        name: 'Wireless Mouse',
        sku: 'WM-005',
      },
      quantity: 30,
      quantityChange: 10,
      type: 'out',
      reference: 'INV-5678',
      invoiceId: 'invoice-3',
      notes: 'Online order',
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  ];
} 