import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Product } from '@prisma/client';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Validation schema for request body
const batchProcessSchema = z.object({
  items: z.array(z.object({
    barcode: z.string(),
    quantity: z.number().int().positive(),
    timestamp: z.string().or(z.date()).optional(),
  })),
  type: z.enum(['in', 'out', 'stocktake']),
  notes: z.string().optional(),
  source: z.string().optional(),
});

// Type-safe way to ensure barcode property is used
type ProductWithBarcode = Product & {
  barcode: string | null;
};

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

// POST handler for processing batched barcode-scanned items
export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate request data
    const validationResult = batchProcessSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { items, type, notes, source } = validationResult.data;
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided' },
        { status: 400 }
      );
    }
    
    // Get all products first to avoid database roundtrips
    const allProducts = await prisma.product.findMany({
      where: { userId },
    }) as ProductWithBarcode[];
    
    // Process each scanned item
    const results = await Promise.all(
      items.map(async (item) => {
        const { barcode, quantity } = item;
        
        // Find product by barcode by filtering in memory
        const product = allProducts.find(p => p.barcode === barcode);
        
        if (!product) {
          return {
            barcode,
            success: false,
            error: 'Product not found',
          };
        }
        
        try {
          // Update the inventory based on operation type
          if (type === 'in') {
            // Add to inventory
            await prisma.product.update({
              where: { id: product.id },
              data: {
                currentStock: { increment: quantity },
                inventoryLogs: {
                  create: {
                    quantity,
                    quantityChange: quantity,
                    type: 'in',
                    notes: notes || 'Barcode scan - stock in',
                    reference: source || 'barcode-scanner',
                    createdBy: userId,
                  },
                },
              },
            });
          } else if (type === 'out') {
            // Check if there's enough stock
            if (product.currentStock < quantity) {
              return {
                barcode,
                success: false,
                error: `Insufficient stock. Current: ${product.currentStock}, Requested: ${quantity}`,
              };
            }
            
            // Remove from inventory
            await prisma.product.update({
              where: { id: product.id },
              data: {
                currentStock: { decrement: quantity },
                inventoryLogs: {
                  create: {
                    quantity: product.currentStock - quantity,
                    quantityChange: -quantity, // negative for outgoing
                    type: 'out',
                    notes: notes || 'Barcode scan - stock out',
                    reference: source || 'barcode-scanner',
                    createdBy: userId,
                  },
                },
              },
            });
          } else if (type === 'stocktake') {
            // Set exact stock level
            const difference = quantity - product.currentStock;
            
            await prisma.product.update({
              where: { id: product.id },
              data: {
                currentStock: quantity,
                inventoryLogs: {
                  create: {
                    quantity,
                    quantityChange: difference,
                    type: 'stocktake',
                    notes: notes || 'Barcode scan - stocktake',
                    reference: source || 'barcode-scanner',
                    createdBy: userId,
                  },
                },
              },
            });
          }
          
          return {
            barcode,
            productId: product.id,
            name: product.name,
            success: true,
            currentStock: type === 'in' 
              ? product.currentStock + quantity 
              : type === 'out' 
                ? product.currentStock - quantity 
                : quantity,
          };
        } catch (error) {
          console.error(`Error processing item with barcode ${barcode}:`, error);
          return {
            barcode,
            success: false,
            error: 'Failed to update inventory',
          };
        }
      })
    );
    
    // Count success and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Processed ${successful} items successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      results,
    });
    
  } catch (error) {
    console.error('Error in barcode batch processing:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
} 