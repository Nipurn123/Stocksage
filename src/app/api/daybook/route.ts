import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/daybook - Get all daybook entries for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = null;
    
    // For authenticated users, get their entries
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user) {
        userId = user.id;
      }
    }
    
    // If not authenticated, return demo entries or an empty array
    if (!userId) {
      // Parse query parameters
      const url = new URL(request.url);
      const searchTerm = url.searchParams.get('search') || '';
      const date = url.searchParams.get('date');
      
      // For development/testing - return all entries when not authenticated
      try {
        // Get admin user for fallback
        const admin = await prisma.user.findFirst({
          where: { email: 'admin@stocksage.com' },
        });
        
        if (admin) {
          // Build the query
          const whereCondition: Record<string, any> = {
            userId: admin.id,
          };
          
          // Filter by date if provided
          if (date) {
            const selectedDate = new Date(date);
            
            // Set the time to the beginning of the day
            const startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            
            // Set the time to the end of the day
            const endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 999);
            
            whereCondition.date = {
              gte: startDate,
              lte: endDate,
            };
          }
          
          // Get the entries
          const entries = await prisma.daybookEntry.findMany({
            where: whereCondition,
            include: {
              tags: true,
            },
            orderBy: {
              date: 'desc',
            },
          });
          
          // If search term is provided, filter the entries in memory
          let filteredEntries = entries;
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filteredEntries = entries.filter(entry => 
              entry.title.toLowerCase().includes(search) ||
              entry.content.toLowerCase().includes(search) ||
              entry.tags.some(tag => tag.name.toLowerCase().includes(search))
            );
          }
          
          // Format the response
          const formattedEntries = filteredEntries.map(entry => ({
            id: entry.id,
            title: entry.title,
            content: entry.content,
            date: entry.date,
            tags: entry.tags.map(tag => tag.name),
          }));
          
          return NextResponse.json(formattedEntries);
        }
      } catch (err) {
        console.error('Error fetching fallback entries:', err);
      }
      
      // If no entries found or error, return empty array
      return NextResponse.json([]);
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || '';
    const date = url.searchParams.get('date');
    
    // Build the query
    const whereCondition: Record<string, any> = {
      userId,
    };
    
    // Filter by date if provided
    if (date) {
      const selectedDate = new Date(date);
      
      // Set the time to the beginning of the day
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Set the time to the end of the day
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      whereCondition.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    
    // Get the entries
    const entries = await prisma.daybookEntry.findMany({
      where: whereCondition,
      include: {
        tags: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    // If search term is provided, filter the entries in memory
    let filteredEntries = entries;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredEntries = entries.filter(entry => 
        entry.title.toLowerCase().includes(search) ||
        entry.content.toLowerCase().includes(search) ||
        entry.tags.some(tag => tag.name.toLowerCase().includes(search))
      );
    }
    
    // Format the response
    const formattedEntries = filteredEntries.map(entry => ({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      date: entry.date,
      tags: entry.tags.map(tag => tag.name),
    }));
    
    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('Error fetching daybook entries:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching daybook entries' },
      { status: 500 }
    );
  }
}

// POST /api/daybook - Create a new daybook entry
export async function POST(request: NextRequest) {
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
    
    // If not authenticated, find admin user for testing
    if (!userId) {
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
    
    // Create or get tags
    const tagObjects = [];
    
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        // Find if the tag already exists for this user
        let tag = await prisma.daybookTag.findFirst({
          where: {
            name: tagName,
            userId,
          },
        });
        
        // If not, create it
        if (!tag) {
          tag = await prisma.daybookTag.create({
            data: {
              name: tagName,
              userId,
            },
          });
        }
        
        tagObjects.push({ id: tag.id });
      }
    }
    
    // Create the entry
    const entry = await prisma.daybookEntry.create({
      data: {
        title,
        content,
        date: new Date(date),
        userId,
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
      id: entry.id,
      title: entry.title,
      content: entry.content,
      date: entry.date,
      tags: entry.tags.map(tag => tag.name),
    };
    
    return NextResponse.json(formattedEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating daybook entry:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the daybook entry' },
      { status: 500 }
    );
  }
} 