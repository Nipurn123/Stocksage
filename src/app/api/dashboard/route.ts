import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardStats } from '@/types';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Define interface for the DashboardData model
interface DashboardDataModel {
  findUnique: (args: { where: { userId: string } }) => Promise<DashboardData | null>;
  upsert: (args: {
    where: { userId: string };
    update: DashboardDataUpdateInput;
    create: DashboardDataCreateInput;
  }) => Promise<DashboardData>;
}

// Interface for the DashboardData record
interface DashboardData {
  userId: string;
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  salesSummary: string;
  recentActivities: string;
  lastUpdated: Date;
  updatedAt: Date;
  createdAt?: Date;
}

// Input types for upsert operation
interface DashboardDataUpdateInput {
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  salesSummary: string;
  recentActivities: string;
  lastUpdated: Date;
  updatedAt: Date;
}

interface DashboardDataCreateInput {
  userId: string;
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  salesSummary: string;
  recentActivities: string;
}

// Create a typed version of prisma with dashboard data
declare global {
  // eslint-disable-next-line no-var
  var _prismaWithDashboard: PrismaClient | undefined;
}

// Try to get an instance that has the updated schema
const getPrismaWithDashboardModel = () => {
  // Return existing instance if available
  if (global._prismaWithDashboard) {
    return global._prismaWithDashboard;
  }
  
  // Otherwise, return the regular prisma instance
  // TypeScript will complain but we know the model exists after migration
  return prisma as PrismaClient & { dashboardData: DashboardDataModel };
};

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Function to generate dashboard data for a user (real or mock)
async function getDashboardData(userId: string, isGuest: boolean = false): Promise<DashboardStats> {
  try {
    // Get prisma instance with dashboard model
    const prismaWithDashboard = getPrismaWithDashboardModel();
    
    // First check if the user already has dashboard data
    let dashboardData = null;
    
    try {
      // Use the findUnique operation which is safer and handles constraints properly
      const existingData = await prismaWithDashboard.dashboardData.findUnique({
        where: { userId }
      });
      
      if (existingData) {
        dashboardData = existingData;
      }
    } catch (e) {
      // If the table doesn't exist yet or there's a different error, log and continue
      console.log('Could not find user dashboard data:', e);
    }

    // If data is missing or older than 1 hour, generate new data
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const shouldUpdateData = !dashboardData || new Date(dashboardData.lastUpdated) < oneHourAgo;
    
    if (shouldUpdateData) {
      // In a real app, we would query real data from the database
      // For now, generate some mock data based on the user's guest status
      
      // Get real product count if available
      const productCount = await prisma.product.count({
        where: { userId },
      });
      
      // Create or update structured data
      const salesSummaryData = {
        today: isGuest ? 1250 : 4890,
        thisWeek: isGuest ? 7830 : 28450,
        thisMonth: isGuest ? 24500 : 112380
      };
      
      const recentActivitiesData = [
        {
          id: '1',
          type: 'order',
          description: 'New order #1234 received',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'inventory',
          description: 'Inventory updated for 5 products',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'alert',
          description: 'Low stock alert for "Wireless Keyboard"',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          type: 'invoice',
          description: 'Invoice #INV-2023-042 paid',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      // First check if the user exists before trying to upsert
      const userExists = await prismaWithDashboard.user.findUnique({
        where: { id: userId }
      });
      
      if (!userExists) {
        console.warn('User not found, returning mock data instead');
        return getMockDashboardData(isGuest);
      }
      
      // Use Prisma's upsert operation for safer handling of constraints
      dashboardData = await prismaWithDashboard.dashboardData.upsert({
        where: { 
          userId 
        },
        update: {
          totalSales: isGuest ? 35620 : 145730,
          totalProducts: productCount || (isGuest ? 42 : 157),
          lowStockItems: isGuest ? 5 : 12,
          outOfStockItems: isGuest ? 2 : 7,
          salesSummary: JSON.stringify(salesSummaryData),
          recentActivities: JSON.stringify(recentActivitiesData),
          lastUpdated: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          totalSales: isGuest ? 35620 : 145730,
          totalProducts: productCount || (isGuest ? 42 : 157),
          lowStockItems: isGuest ? 5 : 12,
          outOfStockItems: isGuest ? 2 : 7,
          salesSummary: JSON.stringify(salesSummaryData),
          recentActivities: JSON.stringify(recentActivitiesData)
        }
      });
    }

    // If we couldn't get/store data from DB, return mock data
    if (!dashboardData) {
      return getMockDashboardData(isGuest);
    }

    // Convert the stored data to expected format and return
    return {
      totalSales: dashboardData.totalSales || 0,
      totalProducts: dashboardData.totalProducts || 0,
      lowStockItems: dashboardData.lowStockItems || 0,
      outOfStockItems: dashboardData.outOfStockItems || 0,
      salesSummary: dashboardData.salesSummary ? JSON.parse(dashboardData.salesSummary) : {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      recentActivities: dashboardData.recentActivities ? JSON.parse(dashboardData.recentActivities) : [],
      recentInvoices: [], // Fetch from invoices table in a real app
      topSellingProducts: [], // Fetch from products table in a real app
      salesOverTime: [], // Calculate from historical data in a real app
      activeOrders: 0,
      pendingPayments: 0,
      overduePayments: 0
    };
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    // Fallback to mock data if database operations fail
    return getMockDashboardData(isGuest);
  }
}

// Backup mock data function for fallback
function getMockDashboardData(isGuest: boolean): DashboardStats {
  const businessName = 'WeaveMitra';
  
  return {
    totalSales: isGuest ? 78650 : 245730,
    totalProducts: isGuest ? 42 : 157,
    lowStockItems: isGuest ? 5 : 12,
    outOfStockItems: isGuest ? 2 : 7,
    recentInvoices: [
      {
        id: '1',
        invoiceNumber: `${businessName}-INV-2023-001`,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Ethnic Retail Store',
        customerEmail: 'orders@ethnicretail.com',
        totalAmount: 23500.00,
        status: 'paid',
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      },
      {
        id: '2',
        invoiceNumber: `${businessName}-INV-2023-002`,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Luxe Boutique',
        customerEmail: 'procurement@luxeboutique.com',
        totalAmount: 45750.50,
        status: 'sent',
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      },
      {
        id: '3',
        invoiceNumber: `${businessName}-INV-2023-003`,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Handicraft Emporium',
        customerEmail: 'purchasing@handicraftemporium.com',
        totalAmount: 18735.25,
        status: 'overdue',
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      }
    ],
    topSellingProducts: [
      {
        product: {
          id: '1',
          name: 'Mysore Silk Saree',
          description: 'Traditional handwoven Mysore silk saree with pure gold zari work',
          sku: 'WM-SAR-001',
          price: 8499.99,
          cost: 5525.00,
          currentStock: 12,
          minStockLevel: 5,
          category: 'Sarees',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        soldQuantity: 87
      },
      {
        product: {
          id: '2',
          name: 'Karnataka Cotton Ikat Saree',
          description: 'Handwoven cotton saree with traditional ikat patterns from Karnataka',
          sku: 'WM-SAR-002',
          price: 3499.99,
          cost: 1925.50,
          currentStock: 23,
          minStockLevel: 10,
          category: 'Sarees',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        soldQuantity: 124
      },
      {
        product: {
          id: '3',
          name: 'Lambani Embroidered Bag',
          description: 'Handcrafted bag with traditional Lambani embroidery by WeaveMitra artisans',
          sku: 'WM-ACC-001',
          price: 1299.99,
          cost: 650.75,
          currentStock: 35,
          minStockLevel: 15,
          category: 'Accessories',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        soldQuantity: 98
      }
    ],
    salesOverTime: [
      { date: '2023-01-01', amount: 152000 },
      { date: '2023-02-01', amount: 167500 },
      { date: '2023-03-01', amount: 189000 },
      { date: '2023-04-01', amount: 175000 },
      { date: '2023-05-01', amount: 223000 },
      { date: '2023-06-01', amount: 258000 },
      { date: '2023-07-01', amount: 241000 },
      { date: '2023-08-01', amount: 285000 },
      { date: '2023-09-01', amount: 312000 },
      { date: '2023-10-01', amount: 357000 },
      { date: '2023-11-01', amount: 398000 },
      { date: '2023-12-01', amount: 456000 }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'order',
        description: 'New order #WM-3254 received from Ethnic Retail Store',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'inventory',
        description: 'Inventory updated for 8 handloom fabric products',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'alert',
        description: 'Low stock alert for "Mysore Silk Saree"',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'invoice',
        description: 'Invoice #WM-INV-2023-042 paid by Luxe Boutique',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      }
    ],
    salesSummary: {
      today: isGuest ? 23500 : 48900,
      thisWeek: isGuest ? 78650 : 287450,
      thisMonth: isGuest ? 245000 : 1123800
    },
    activeOrders: isGuest ? 5 : 18,
    pendingPayments: isGuest ? 3 : 12,
    overduePayments: isGuest ? 1 : 4
  };
}

export async function GET() {
  try {
    // Try to get auth session from NextAuth
    const session = await getServerSession(authOptions);
    
    // Get user ID from session
    let userId = session?.user?.id;
    let isGuest = session?.user?.role === 'guest';
    
    // If no user ID is found, check if we're in development mode
    if (!userId) {
      // For development convenience, create a guest user ID
      if (process.env.NODE_ENV === 'development') {
        userId = 'guest-user-id';
        isGuest = true;
      } else {
        // In production, require authentication
        return NextResponse.json({ error: 'Unauthorized, please sign in' }, { status: 401 });
      }
    }
    
    // Get dashboard data for the user
    const dashboardData = await getDashboardData(userId, isGuest);
    
    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 