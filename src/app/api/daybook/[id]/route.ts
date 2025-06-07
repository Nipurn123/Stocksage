import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/daybook/[id] - Get a specific daybook entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    let userId = null;
    
    // For authenticated users, use their ID
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user) {
        userId = user.id;
      }
    }
    
    // Get the entry
    const entry = await prisma.daybookEntry.findUnique({
      where: {
        id: params.id,
      },
      include: {
        tags: true,
      },
    });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // In development mode, allow access without authorization
    const isDevMode = process.env.NODE_ENV === 'development';
    
    // Check if the entry belongs to the user (skip in dev mode)
    if (userId && !isDevMode && entry.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this entry' },
        { status: 403 }
      );
    }
    
    // Format the response
    const formattedEntry = {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      date: entry.date,
      tags: entry.tags.map(tag => tag.name),
    };
    
    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error fetching daybook entry:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the daybook entry' },
      { status: 500 }
    );
  }
}

// PUT /api/daybook/[id] - Update a daybook entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    let userId = null;
    
    // For authenticated users, use their ID
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user) {
        userId = user.id;
      }
    }
    
    // Find the entry
    const existingEntry = await prisma.daybookEntry.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // In development mode, allow access without authorization
    const isDevMode = process.env.NODE_ENV === 'development';
    
    // If not authenticated and not in dev mode, use admin account
    if (!userId && !isDevMode) {
      const admin = await prisma.user.findFirst({
        where: { email: 'admin@stocksage.com' },
      });
      
      if (admin) {
        userId = admin.id;
      } else {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    // Check if the entry belongs to the user (skip in dev mode)
    if (userId && !isDevMode && existingEntry.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this entry' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { title, content, date, tags } = body;
    
    // Validate the input
    if (!title || !content || !date) {
      return NextResponse.json(
        { error: 'Title, content, and date are required' },
        { status: 400 }
      );
    }
    
    // Disconnect all existing tags
    await prisma.daybookEntry.update({
      where: {
        id: params.id,
      },
      data: {
        tags: {
          set: [],
        },
      },
    });
    
    // Create or get tags
    const tagObjects = [];
    const currentUserId = userId || existingEntry.userId; // Use existing entry user ID if needed
    
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        // Find if the tag already exists for this user
        let tag = await prisma.daybookTag.findFirst({
          where: {
            name: tagName,
            userId: currentUserId,
          },
        });
        
        // If not, create it
        if (!tag) {
          tag = await prisma.daybookTag.create({
            data: {
              name: tagName,
              userId: currentUserId,
            },
          });
        }
        
        tagObjects.push({ id: tag.id });
      }
    }
    
    // Update the entry
    const updatedEntry = await prisma.daybookEntry.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        content,
        date: new Date(date),
        tags: {
          connect: tagObjects,
        },
      },
      include: {
        tags: true,
      },
    });
    
    // Format the response
    const formattedEntry = {
      id: updatedEntry.id,
      title: updatedEntry.title,
      content: updatedEntry.content,
      date: updatedEntry.date,
      tags: updatedEntry.tags.map(tag => tag.name),
    };
    
    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error updating daybook entry:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the daybook entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/daybook/[id] - Delete a daybook entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    let userId = null;
    
    // For authenticated users, use their ID
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user) {
        userId = user.id;
      }
    }
    
    // Find the entry
    const existingEntry = await prisma.daybookEntry.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // In development mode, allow access without authorization
    const isDevMode = process.env.NODE_ENV === 'development';
    
    // Check if the entry belongs to the user (skip in dev mode)
    if (userId && !isDevMode && existingEntry.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this entry' },
        { status: 403 }
      );
    }
    
    // Delete the entry
    await prisma.daybookEntry.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daybook entry:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the daybook entry' },
      { status: 500 }
    );
  }
} 