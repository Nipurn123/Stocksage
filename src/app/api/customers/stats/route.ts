import { NextResponse } from 'next/server';
import { ApiResponse, Customer, CustomerStats } from '@/types';

export async function GET() {
  try {
    // Mock customer data - In a real app, this would come from a database
    const mockCustomers: Customer[] = Array.from({ length: 15 }, (_, i) => ({
      id: `cust_${i + 1}`,
      fullName: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: i % 3 === 0 ? undefined : `+1 555-${100 + i}`,
      company: i % 4 === 0 ? `Company ${i}` : undefined,
      address: `${100 + i} Main Street`,
      city: i % 3 === 0 ? 'New York' : i % 2 === 0 ? 'San Francisco' : 'Chicago',
      state: i % 3 === 0 ? 'NY' : i % 2 === 0 ? 'CA' : 'IL',
      zipCode: `${10000 + i}`,
      country: 'USA',
      notes: i % 5 === 0 ? `Notes for customer ${i + 1}` : undefined,
      userId: 'user_1',
      totalSpent: Math.round(Math.random() * 10000) + 500,
      lastPurchaseDate: new Date(Date.now() - (i * 86400000)).toISOString(), // Last i days
      createdAt: new Date(Date.now() - (i * 5 * 86400000)).toISOString(), // Created i*5 days ago
      updatedAt: new Date(Date.now() - (i * 2 * 86400000)).toISOString(), // Updated i*2 days ago
    }));
    
    // Calculate top customers by total spent
    const topCustomers = mockCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(customer => ({
        customer,
        totalSpent: customer.totalSpent,
        orderCount: Math.floor(Math.random() * 15) + 1
      }));
    
    // Get recent customers (newest first)
    const recentCustomers = [...mockCustomers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // Calculate customers by month for the last 6 months
    const now = new Date();
    const customersByMonth = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now);
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStr = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      return {
        month: monthStr,
        count: Math.floor(Math.random() * 20) + 5, // Random count between 5-25
      };
    }).reverse();
    
    // Calculate new customers this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newCustomersThisMonth = mockCustomers.filter(customer => {
      const customerDate = new Date(customer.createdAt);
      return customerDate.getMonth() === currentMonth && customerDate.getFullYear() === currentYear;
    }).length;
    
    // Create response
    const customerStats: CustomerStats = {
      totalCustomers: mockCustomers.length,
      newCustomersThisMonth,
      topCustomers,
      recentCustomers,
      customersByMonth,
    };
    
    const response: ApiResponse<CustomerStats> = {
      success: true,
      data: customerStats
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in customer stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
} 