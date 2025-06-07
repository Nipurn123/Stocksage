import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getGenerativeAIResponse } from '@/lib/ai/gemini';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Validation schemas for different operations
const batchUpdateSchema = z.object({
  productIds: z.array(z.string()),
  data: z.object({
    category: z.string().optional(),
    price: z.number().optional(),
    cost: z.number().optional(),
    minStockLevel: z.number().optional(),
    // Add other fields as needed
  })
});

const batchDeleteSchema = z.object({
  productIds: z.array(z.string())
});

const aiSuggestionSchema = z.object({
  productIds: z.array(z.string()).optional(),
  operation: z.enum(['stockLevel', 'pricing', 'categorization']),
  prompt: z.string().optional(),
});

/**
 * GET endpoint to get batch operation suggestions
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const productIds = searchParams.get('productIds')?.split(',') || [];
    
    // Get products for the specified IDs or all user products
    const products = productIds.length > 0 
      ? await prisma.product.findMany({
          where: { 
            id: { in: productIds },
            userId 
          }
        })
      : await prisma.product.findMany({
          where: { userId },
          take: 20 // Limit to 20 for performance
        });
    
    if (products.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No products found' 
      }, { status: 404 });
    }
    
    // Get AI suggestions based on operation type
    let suggestions;
    switch (operation) {
      case 'stockLevel':
        suggestions = await getGenerativeAIResponse('inventoryForecasting', { products });
        break;
      case 'pricing':
        suggestions = await getGenerativeAIResponse('pricingOptimization', { products });
        break;
      case 'categorization':
        suggestions = await getGenerativeAIResponse('categorySuggestions', { products });
        break;
      default:
        suggestions = await getGenerativeAIResponse('inventoryInsights', { products });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        products,
        suggestions
      }
    });
  } catch (error) {
    console.error('Error generating batch suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for batch update operations
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const validationResult = aiSuggestionSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }
    
    const { productIds, operation, prompt } = validationResult.data;
    
    // Get products to analyze
    const products = productIds && productIds.length > 0
      ? await prisma.product.findMany({
          where: { 
            id: { in: productIds },
            userId 
          }
        })
      : await prisma.product.findMany({
          where: { userId },
          take: 20 // Limit to 20 for AI processing
        });
    
    if (products.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No products found' 
      }, { status: 404 });
    }
    
    // Generate AI suggestions
    const aiFunction = 
      operation === 'stockLevel' ? 'inventoryForecasting' :
      operation === 'pricing' ? 'pricingOptimization' :
      operation === 'categorization' ? 'categorySuggestions' :
      'inventoryInsights';
    
    const suggestions = await getGenerativeAIResponse(aiFunction, { 
      products,
      customPrompt: prompt
    });
    
    return NextResponse.json({ 
      success: true, 
      data: suggestions
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}

/**
 * PUT endpoint for batch updates
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const validationResult = batchUpdateSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }
    
    const { productIds, data: updateData } = validationResult.data;
    
    // Verify all products belong to the user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: { id: true, userId: true }
    });
    
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more products not found' },
        { status: 404 }
      );
    }
    
    const unauthorizedProducts = products.filter(p => p.userId !== userId);
    if (unauthorizedProducts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update one or more products' },
        { status: 403 }
      );
    }
    
    // Perform the batch update
    const results = await Promise.all(
      productIds.map(async (id) => {
        try {
          const updated = await prisma.product.update({
            where: { id },
            data: updateData
          });
          return { id, success: true, data: updated };
        } catch (error) {
          console.error(`Error updating product ${id}:`, error);
          return { id, success: false, error: 'Failed to update' };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error performing batch update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform batch update' },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint for batch deletes
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const validationResult = batchDeleteSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }
    
    const { productIds } = validationResult.data;
    
    // Verify all products belong to the user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: { id: true, userId: true }
    });
    
    const unauthorizedProducts = products.filter(p => p.userId !== userId);
    if (unauthorizedProducts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete one or more products' },
        { status: 403 }
      );
    }
    
    // Perform the batch delete
    const results = await Promise.all(
      productIds.map(async (id) => {
        try {
          // Delete related inventory logs first
          await prisma.inventoryLog.deleteMany({
            where: { productId: id }
          });
          
          // Then delete the product
          await prisma.product.delete({
            where: { id }
          });
          
          return { id, success: true };
        } catch (error) {
          console.error(`Error deleting product ${id}:`, error);
          return { id, success: false, error: 'Failed to delete' };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error performing batch delete:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform batch delete' },
      { status: 500 }
    );
  }
} 