import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardStats } from '@/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Mock data function - in a real application, this would fetch from a database
function getMockDashboardData(isGuest: boolean): DashboardStats {
  return {
    totalSales: isGuest ? 35620 : 145730,
    totalProducts: isGuest ? 42 : 157,
    lowStockItems: isGuest ? 5 : 12,
    outOfStockItems: isGuest ? 2 : 7,
    recentInvoices: [
      {
        id: '1',
        invoiceNumber: 'INV-2023-001',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Acme Corporation',
        customerEmail: 'billing@acme.com',
        totalAmount: 1250.00,
        status: 'paid',
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      },
      {
        id: '2',
        invoiceNumber: 'INV-2023-002',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Globex Industries',
        customerEmail: 'accounts@globex.com',
        totalAmount: 2489.50,
        status: 'sent',
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      },
      {
        id: '3',
        invoiceNumber: 'INV-2023-003',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Stark Industries',
        customerEmail: 'finance@stark.com',
        totalAmount: 4785.25,
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
          name: 'Wireless Keyboard',
          description: 'Ergonomic wireless keyboard with backlight',
          sku: 'KB-WL-001',
          price: 79.99,
          cost: 45.00,
          currentStock: 23,
          minStockLevel: 10,
          category: 'Electronics',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        soldQuantity: 342
      },
      {
        product: {
          id: '2',
          name: 'Bluetooth Mouse',
          description: 'Precision bluetooth mouse with programmable buttons',
          sku: 'MS-BT-002',
          price: 49.99,
          cost: 28.50,
          currentStock: 45,
          minStockLevel: 15,
          category: 'Electronics',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        soldQuantity: 287
      },
      {
        product: {
          id: '3',
          name: 'USB-C Hub',
          description: '7-in-1 USB-C hub with HDMI and SD card reader',
          sku: 'HUB-C-003',
          price: 59.99,
          cost: 32.75,
          currentStock: 18,
          minStockLevel: 10,
          category: 'Electronics',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        soldQuantity: 215
      }
    ],
    salesOverTime: [
      { date: '2023-01-01', amount: 12500 },
      { date: '2023-02-01', amount: 15700 },
      { date: '2023-03-01', amount: 18900 },
      { date: '2023-04-01', amount: 17500 },
      { date: '2023-05-01', amount: 22300 },
      { date: '2023-06-01', amount: 25800 },
      { date: '2023-07-01', amount: 24100 },
      { date: '2023-08-01', amount: 28500 },
      { date: '2023-09-01', amount: 31200 },
      { date: '2023-10-01', amount: 35700 },
      { date: '2023-11-01', amount: 39800 },
      { date: '2023-12-01', amount: 45600 }
    ],
    // Add recent activities
    recentActivities: [
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
    ],
    // Add sales summary for today, this week, this month
    salesSummary: {
      today: isGuest ? 1250 : 4890,
      thisWeek: isGuest ? 7830 : 28450,
      thisMonth: isGuest ? 24500 : 112380
    }
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isGuest = session.user.role === 'guest';
    const dashboardData = getMockDashboardData(isGuest);

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 