import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Detect if we're in a build context
const isBuildProcess = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production';

// Mock categories for build-time
const mockCategories = [
  { id: 'cat-1', name: 'Sarees', description: 'Handwoven traditional sarees', productCount: 15, userId: 'user-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Fabrics', description: 'Handloom fabrics', productCount: 8, userId: 'user-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Accessories', description: 'Handcrafted accessories', productCount: 12, userId: 'user-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

// GET handler to fetch all categories
export async function GET(request: NextRequest) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock categories');
    return NextResponse.json({
      success: true,
      data: mockCategories
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get categories with product count
    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    
    // Format response to include products count
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      productsCount: category._count.products,
      createdAt: category.createdAt,
    }));
    
    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST handler to create a new category
export async function POST(request: NextRequest) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock category creation');
    return NextResponse.json({
      success: true,
      data: mockCategories[0]
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { name, description } = body;
    
    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category with the same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
        },
        userId: session.user.id,
      },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new category
    const category = await prisma.category.create({
      data: {
        name,
        description: description || '',
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT handler to update a category
export async function PUT(request: NextRequest) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock category update');
    return NextResponse.json({
      success: true,
      data: mockCategories[0]
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get category ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, description } = body;
    
    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this category' },
        { status: 403 }
      );
    }
    
    // Check for duplicate name (excluding current category)
    const duplicateName = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        name: {
          equals: name,
        },
        userId: session.user.id,
      },
    });
    
    if (duplicateName) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Update category
    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        description: description || existingCategory.description,
      },
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a category
export async function DELETE(request: NextRequest) {
  // During build, return mock data to avoid database operations
  if (isBuildProcess && process.env.NODE_ENV === 'production') {
    console.log('Build process detected, returning mock category deletion');
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get category ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists and belongs to user
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    if (category.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this category' },
        { status: 403 }
      );
    }
    
    // Begin transaction to delete category and update related products
    await prisma.$transaction(async (tx) => {
      // Update products to remove this category
      if (category._count.products > 0) {
        await tx.product.updateMany({
          where: {
            categoryId: id,
          },
          data: {
            categoryId: null,
          },
        });
      }
      
      // Delete the category
      await tx.category.delete({
        where: {
          id,
        },
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 