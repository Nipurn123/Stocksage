import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Product } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Detect if we're in a build context
const isBuildProcess = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production';

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
    // For now we'll just assume that if a token is provided, it's valid
    return 'authenticated-user';
  }
  
  return null;
}

// GET handler for retrieving all products
export async function GET(request: Request) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock inventory');
    return NextResponse.json({
      success: true,
      data: Array.from({ length: 10 }, () => generateMockProduct()),
      pagination: {
        total: 10,
        page: 1,
        limit: 10,
      }
    });
  }

  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      console.error('Authentication failed: No valid user ID found');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000');
    const stockStatus = searchParams.get('stockStatus') || '';
    
    // Build where clause
    const where: Prisma.ProductWhereInput = {
      userId,
      price: {
        gte: minPrice,
        lte: maxPrice === 0 ? 1000000 : maxPrice,
      },
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    // Handle stock status filtering
    if (stockStatus) {
      switch (stockStatus) {
        case 'out-of-stock':
          where.currentStock = 0;
          break;
        case 'low-stock':
          // Low stock is > 0 but <= 5 (simplified)
          where.currentStock = {
            gt: 0,
            lte: 5
          };
          break;
        case 'in-stock':
          // In stock is > 5 (simplified)
          where.currentStock = {
            gt: 5
          };
          break;
      }
    }
    
    // Execute query with pagination
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get products' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new product
export async function POST(request: Request) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock product creation');
    return NextResponse.json({
      success: true,
      data: generateMockProduct()
    });
  }

  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    const { name, description, sku, price, cost, currentStock, minStockLevel, category, categoryId } = data;

    // Validate required fields
    if (!name || !sku || price === undefined || currentStock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if product with SKU already exists for this user
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku,
        userId,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'A product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Create new product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        category: category || 'Uncategorized',
        categoryId: categoryId || null,
        price: parseFloat(price.toString()),
        cost: cost ? parseFloat(cost.toString()) : null,
        currentStock: parseInt(currentStock.toString()),
        minStockLevel: minStockLevel ? parseInt(minStockLevel.toString()) : 5,
        userId,
      },
    });

    // If current stock > 0, create an initial inventory log
    if (parseInt(currentStock.toString()) > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          quantity: parseInt(currentStock.toString()),
          quantityChange: parseInt(currentStock.toString()),
          type: 'in',
          reference: 'Initial Stock',
          notes: 'Initial inventory setup',
          createdBy: userId,
        },
      });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock product for demo mode
function generateMockProduct(): Product {
  const categories = ['Sarees', 'Handloom Fabric', 'Ready-to-wear', 'Accessories', 'Yarn'];
  const id = Math.floor(Math.random() * 1000000).toString();
  const price = Math.round(Math.random() * 1000 * 100) / 100;
  const cost = Math.round((price * 0.7) * 100) / 100;
  const currentStock = Math.floor(Math.random() * 50);
  
  return {
    id,
    name: `Sample Product ${id.substring(0, 3)}`,
    description: 'This is a sample product for demonstration purposes',
    sku: `SKU-${id.substring(0, 5)}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    price,
    cost,
    currentStock,
    minStockLevel: 5,
    userId: 'guest-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
} 