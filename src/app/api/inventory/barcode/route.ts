import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Function to get the user ID from either Clerk or NextAuth
async function getUserId(request: Request): Promise<string | null> {
  // First try Clerk
  try {
    const clerkAuth = auth();
    if (clerkAuth && typeof clerkAuth === 'object' && 'userId' in clerkAuth) {
      const userId = clerkAuth.userId as string;
      if (userId) return userId;
    }
  } catch (error) {
    console.error('Error with Clerk auth:', error);
  }
  
  // Then try NextAuth
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch (error) {
    console.error('Error with NextAuth:', error);
  }
  
  // Finally, try to extract from Authorization header (for client-side auth)
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // This is simplified - in a real app you'd want to verify this token
    return 'authenticated-user';
  }
  
  return null;
}

// GET handler for retrieving a product by barcode
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    
    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode is required' },
        { status: 400 }
      );
    }
    
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find product by barcode
    const product = await prisma.product.findFirst({
      where: {
        barcode: barcode,
        userId: userId,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found', barcode },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// POST handler for generating a barcode for a product
export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { productId, barcode } = data;
    
    if (!productId || !barcode) {
      return NextResponse.json(
        { success: false, error: 'Product ID and barcode are required' },
        { status: 400 }
      );
    }
    
    // Check if barcode already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        barcode: barcode,
      },
    });
    
    if (existingProduct && existingProduct.id !== productId) {
      return NextResponse.json(
        { success: false, error: 'Barcode already exists for another product' },
        { status: 400 }
      );
    }
    
    // Update product with new barcode
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        barcode: barcode,
      },
    });
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product barcode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a product's barcode and QR code data
export async function PUT(request: Request) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { productId, barcode, qrCodeData } = data;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the product exists and belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: userId,
      },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found or you do not have permission to modify it' },
        { status: 404 }
      );
    }
    
    // If a barcode is provided, check if it's unique
    if (barcode) {
      const barcodeExists = await prisma.product.findFirst({
        where: {
          barcode: barcode,
          id: { not: productId },
        },
      });
      
      if (barcodeExists) {
        return NextResponse.json(
          { success: false, error: 'Barcode already exists for another product' },
          { status: 400 }
        );
      }
    }
    
    // Update the product
    const updateData: { barcode?: string; qrCodeData?: string } = {};
    if (barcode !== undefined) updateData.barcode = barcode;
    if (qrCodeData !== undefined) updateData.qrCodeData = qrCodeData;
    
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product barcode or QR code data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
} 