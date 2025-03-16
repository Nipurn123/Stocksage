import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET handler for retrieving a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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