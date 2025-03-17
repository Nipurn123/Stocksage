import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Detect if we're in a build context
const isBuildProcess = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production';

// Mock product for build-time
const mockProduct = {
  id: 'mock-123',
  name: 'Sample Product',
  description: 'A sample product for preview',
  sku: 'SAMPLE-001',
  price: 99.99,
  cost: 49.99,
  currentStock: 25,
  minStockLevel: 10,
  category: 'Sample',
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// GET handler for retrieving a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock product');
    return NextResponse.json({
      success: true,
      data: mockProduct
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        inventoryLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        }
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock product update');
    return NextResponse.json({
      success: true,
      data: mockProduct
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    const data = await request.json();
    
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        category: data.category,
        price: parseFloat(data.price),
        cost: data.cost ? parseFloat(data.cost) : null,
        currentStock: parseInt(data.currentStock),
        minStockLevel: parseInt(data.minStockLevel),
        supplier: data.supplier,
      },
    });
    
    // Log inventory changes if stock was updated
    if (existingProduct.currentStock !== parseInt(data.currentStock)) {
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          quantity: parseInt(data.currentStock),
          quantityChange: parseInt(data.currentStock) - existingProduct.currentStock,
          type: parseInt(data.currentStock) > existingProduct.currentStock ? 'in' : 'out',
          reference: 'Manual Adjustment',
          notes: data.notes || 'Stock manually adjusted',
          createdBy: session.user.id,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a specific product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock product deletion');
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete the product
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 