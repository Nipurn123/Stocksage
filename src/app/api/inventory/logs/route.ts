import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET handler to fetch all inventory logs with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build filter conditions
    const whereClause: any = {
      userId: session.user.id,
    };
    
    if (productId) {
      whereClause.productId = productId;
    }
    
    if (type && (type === 'in' || type === 'out')) {
      whereClause.type = type;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDateTime;
      }
    }
    
    // Fetch logs with related product details
    const logs = await prisma.inventoryLog.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory logs' },
      { status: 500 }
    );
  }
}

// POST handler to create a new inventory log
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { productId, quantityChange, type, reference, notes, invoiceId } = body;
    
    // Validation
    if (!productId || !quantityChange || !type || !reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (type !== 'in' && type !== 'out') {
      return NextResponse.json(
        { error: 'Type must be either "in" or "out"' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        userId: session.user.id,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Begin transaction to update product stock and create log
    const result = await prisma.$transaction(async (tx) => {
      // Calculate new stock level
      const newStock = type === 'in' 
        ? product.currentStock + quantityChange 
        : product.currentStock - quantityChange;
      
      // Check if stock would go negative for 'out' transactions
      if (type === 'out' && newStock < 0) {
        throw new Error('Insufficient stock');
      }
      
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });
      
      // Create log entry
      const log = await tx.inventoryLog.create({
        data: {
          productId,
          quantity: updatedProduct.currentStock,
          quantityChange,
          type,
          reference,
          notes: notes || null,
          invoiceId: invoiceId || null,
          createdBy: session.user.id,
        },
      });
      
      return { log, updatedProduct };
    });
    
    return NextResponse.json(result.log, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inventory log:', error);
    
    if (error.message === 'Insufficient stock') {
      return NextResponse.json(
        { error: 'Insufficient stock for this operation' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create inventory log' },
      { status: 500 }
    );
  }
} 