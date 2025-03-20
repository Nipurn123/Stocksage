import { NextResponse } from 'next/server';
import { ApiResponse, Customer, CustomerStats, PaginatedResponse } from '@/types';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    
    // Mock data - In a real app, this would come from a database
    const mockCustomers: Customer[] = Array.from({ length: 25 }, (_, i) => ({
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
      totalSpent: 1000 * (i + 1),
      lastPurchaseDate: new Date(Date.now() - (i * 86400000)).toISOString(), // Last i days
      createdAt: new Date(Date.now() - (i * 5 * 86400000)).toISOString(), // Created i*5 days ago
      updatedAt: new Date(Date.now() - (i * 2 * 86400000)).toISOString(), // Updated i*2 days ago
    }));
    
    // Filter by search term
    const filteredCustomers = search 
      ? mockCustomers.filter(customer => 
          customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
          customer.email.toLowerCase().includes(search.toLowerCase()) ||
          (customer.company && customer.company.toLowerCase().includes(search.toLowerCase()))
        )
      : mockCustomers;
    
    // Sort customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      if (sortBy === 'fullName') {
        return sortDirection === 'asc' 
          ? a.fullName.localeCompare(b.fullName)
          : b.fullName.localeCompare(a.fullName);
      } else if (sortBy === 'totalSpent') {
        return sortDirection === 'asc' 
          ? a.totalSpent - b.totalSpent
          : b.totalSpent - a.totalSpent;
      } else if (sortBy === 'lastPurchaseDate') {
        return sortDirection === 'asc' 
          ? new Date(a.lastPurchaseDate || 0).getTime() - new Date(b.lastPurchaseDate || 0).getTime()
          : new Date(b.lastPurchaseDate || 0).getTime() - new Date(a.lastPurchaseDate || 0).getTime();
      }
      // Default sort by createdAt
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);
    
    // Create response
    const response: ApiResponse<PaginatedResponse<Customer>> = {
      success: true,
      data: {
        items: paginatedCustomers,
        total: filteredCustomers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCustomers.length / limit),
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.fullName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Full name and email are required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would save this to the database
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country,
      notes: body.notes,
      userId: 'user_1', // In real app, this would be the authenticated user's ID
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 