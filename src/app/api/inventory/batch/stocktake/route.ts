import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Define the type for scanned items
interface ScannedItem {
  barcode: string;
  quantity: number;
  timestamp: Date;
  productName?: string;
  productSku?: string;
  currentStock?: number;
}

// Function to get the user ID from either Clerk or NextAuth
async function getUserId(request: Request): Promise<string | null> {
  // First try Clerk
  try {
    const clerkAuth = auth();
    const userId = clerkAuth.userId;
    if (userId) return userId;
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

// POST handler for processing batch stocktake data
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
    const { items } = data;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided' },
        { status: 400 }
      );
    }
    
    // Process each scanned item
    const results = await Promise.all(
      items.map(async (item: ScannedItem) => {
        const { barcode, quantity } = item;
        
        // Find product by barcode
        const product = await prisma.product.findFirst({
          where: {
            barcode,
            userId,
          },
        });
        
        if (!product) {
          return {
            barcode,
            success: false,
            error: 'Product not found',
          };
        }
        
        // Calculate quantity change
        const quantityChange = quantity - product.currentStock;
        
        // Update product stock
        const updatedProduct = await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            currentStock: quantity,
          },
        });
        
        // Create inventory log
        await prisma.inventoryLog.create({
          data: {
            productId: product.id,
            quantity,
            quantityChange,
            type: quantityChange >= 0 ? 'adjustment-add' : 'adjustment-remove',
            reason: 'Bulk Scan Stocktake',
            notes: `Stock adjusted from ${product.currentStock} to ${quantity} via barcode scanning`,
            createdBy: userId,
          },
        });
        
        return {
          barcode,
          productId: product.id,
          productName: product.name,
          success: true,
          previousStock: product.currentStock,
          newStock: quantity,
          quantityChange,
        };
      })
    );
    
    const successCount = results.filter(result => result.success).length;
    const failCount = results.length - successCount;
    
    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} items. Updated: ${successCount}, Failed: ${failCount}`,
      results,
    });
  } catch (error) {
    console.error('Error processing stocktake data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process stocktake data' },
      { status: 500 }
    );
  }
} 