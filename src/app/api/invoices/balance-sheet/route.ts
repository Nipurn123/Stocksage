import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime

// Interface for balance sheet data
interface BalanceSheetData {
  period: string;
  generatedAt: string;
  assets: {
    accountsReceivable: {
      total: number;
      breakdown: {
        current: number;
        overdue30: number;
        overdue60: number;
        overdue90Plus: number;
      };
    };
    inventory?: number;
    prepaidExpenses?: number;
  };
  liabilities: {
    accountsPayable: {
      total: number;
      breakdown: {
        current: number;
        overdue30: number;
        overdue60: number;
        overdue90Plus: number;
      };
    };
    taxes?: { 
      salesTax: number;
      otherTaxes: number;
    };
  };
  equity: {
    netAssets: number;
  };
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    currentRatio: number;
  };
  invoiceMetrics: {
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageInvoiceAmount: number;
    invoiceCount: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  projections?: {
    accountsReceivableCollections: {
      next30Days: number;
      next60Days: number;
      next90Days: number;
      beyond90Days: number;
    };
    cashflow: {
      inflows: number;
      outflows: number;
      net: number;
    };
    monthlyRevenueTrend: Record<string, number>;
  };
}

// Define Invoice and InvoiceItem types to avoid using 'any'
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  vendorName: string;
  vendorAddress: string;
  customerName: string;
  customerAddress: string;
  totalAmount: number;
  taxAmount?: number;
  status: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// Get balance sheet data
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    // Get user ID from session
    let userId = session?.user?.id;
    
    // Check for authorization header which might contain a token from Clerk
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ') && !userId) {
      const token = authHeader.substring(7);
      // For development, use the token as a user ID if session is not available
      if (token !== 'guest-user' && process.env.NODE_ENV === 'development') {
        userId = token;
      }
    }
    
    // If no user ID is found, check if we're in development mode
    if (!userId) {
      // For development convenience, create a guest user ID
      if (process.env.NODE_ENV === 'development') {
        userId = 'guest-user-id';
      } else {
        // In production, require authentication
        return NextResponse.json(
          { success: false, error: 'Unauthorized, please sign in' }, 
          { status: 401 }
        );
      }
    }
    
    // Get optional date range from query parameters for the balance sheet period
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || getDefaultStartDate().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    
    try {
      // Fetch all invoices within the date range
      const invoices = await prisma.invoice.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          items: true
        }
      });

      // If no real invoices found in production, generate dummy data in development
      let finalInvoices = invoices;
      if (invoices.length === 0 && process.env.NODE_ENV === 'development') {
        finalInvoices = generateDummyInvoices(startDate, endDate);
        
        // Store dummy data in database (only in development)
        await storeDummyInvoices(finalInvoices);
      }
      
      // Generate balance sheet from the invoices
      const balanceSheet = generateBalanceSheet(finalInvoices, startDate, endDate);
      
      return NextResponse.json({
        success: true,
        data: balanceSheet
      });
    } catch (error: unknown) {
      console.error('Error generating balance sheet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Database error';
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in GET /api/invoices/balance-sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to generate a balance sheet from invoice data
function generateBalanceSheet(invoices: Invoice[], startDate: string, endDate: string): BalanceSheetData {
  // Initialize totals
  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  
  // Initialize counts
  const invoiceCount = invoices.length;
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  
  // Initialize aging buckets for accounts receivable
  let current = 0;
  let overdue30 = 0;
  let overdue60 = 0;
  let overdue90Plus = 0;
  
  // Get current date for aging calculations
  const currentDate = new Date();
  
  // Process each invoice
  invoices.forEach(invoice => {
    const invoiceAmount = invoice.totalAmount || 0;
    totalInvoiced += invoiceAmount;
    
    // Count by status
    switch(invoice.status) {
      case 'paid':
        totalPaid += invoiceAmount;
        paidCount++;
        break;
      case 'pending':
        totalPending += invoiceAmount;
        pendingCount++;
        
        // Only include unpaid invoices in aging
        const dueDate = new Date(invoice.dueDate);
        const daysPastDue = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPastDue <= 0) {
          current += invoiceAmount;
        } else if (daysPastDue <= 30) {
          current += invoiceAmount; // Still considered current for balance sheet
        } else if (daysPastDue <= 60) {
          overdue30 += invoiceAmount;
        } else if (daysPastDue <= 90) {
          overdue60 += invoiceAmount;
        } else {
          overdue90Plus += invoiceAmount;
        }
        break;
      case 'overdue':
        totalOverdue += invoiceAmount;
        overdueCount++;
        
        // Calculate aging for overdue invoices
        const overdueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.floor((currentDate.getTime() - overdueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue <= 30) {
          overdue30 += invoiceAmount;
        } else if (daysOverdue <= 60) {
          overdue60 += invoiceAmount;
        } else {
          overdue90Plus += invoiceAmount;
        }
        break;
      default:
        // Handle other statuses if needed
        break;
    }
  });

  // Calculate accounts receivable total (pending + overdue)
  const accountsReceivableTotal = totalPending + totalOverdue;
  
  // For this example, we're setting some dummy values for other balance sheet items
  const inventoryValue = 25000;
  const prepaidExpenses = 5000;
  
  // For accounts payable, we'll use dummy data
  // In a real system, this would come from vendor invoices/bills
  const accountsPayableTotal = 15000;
  const apCurrent = 10000;
  const apOverdue30 = 3000;
  const apOverdue60 = 1500;
  const apOverdue90Plus = 500;
  
  // Tax liabilities (dummy data)
  const salesTax = 2500;
  const otherTaxes = 1000;
  
  // Calculate totals
  const totalAssets = accountsReceivableTotal + inventoryValue + prepaidExpenses;
  const totalLiabilities = accountsPayableTotal + salesTax + otherTaxes;
  const netWorth = totalAssets - totalLiabilities;
  
  // Calculate current ratio (assets / liabilities)
  const currentRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : 0;
  
  // Calculate average invoice amount
  const averageInvoiceAmount = invoiceCount > 0 ? totalInvoiced / invoiceCount : 0;
  
  // Return the structured balance sheet
  return {
    period: `${startDate} to ${endDate}`,
    generatedAt: new Date().toISOString(),
    assets: {
      accountsReceivable: {
        total: accountsReceivableTotal,
        breakdown: {
          current,
          overdue30,
          overdue60,
          overdue90Plus
        }
      },
      inventory: inventoryValue,
      prepaidExpenses
    },
    liabilities: {
      accountsPayable: {
        total: accountsPayableTotal,
        breakdown: {
          current: apCurrent,
          overdue30: apOverdue30,
          overdue60: apOverdue60,
          overdue90Plus: apOverdue90Plus
        }
      },
      taxes: {
        salesTax,
        otherTaxes
      }
    },
    equity: {
      netAssets: netWorth
    },
    summary: {
      totalAssets,
      totalLiabilities,
      netWorth,
      currentRatio
    },
    invoiceMetrics: {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      averageInvoiceAmount,
      invoiceCount,
      paidCount,
      pendingCount,
      overdueCount
    }
  };
}

// Helper function to generate dummy invoices
function generateDummyInvoices(startDate: string, endDate: string): Invoice[] {
  const invoices: Invoice[] = [];
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  // Statuses and their distribution
  const statuses = ['paid', 'pending', 'overdue'];
  const statusDistribution = [0.6, 0.25, 0.15]; // 60% paid, 25% pending, 15% overdue
  
  // Vendors
  const vendors = [
    'Tech Suppliers Ltd',
    'Office Essentials Inc',
    'Manufacturing Partners Co',
    'Raw Materials Global',
    'Logistics & Shipping Corp'
  ];
  
  // Customers
  const customers = [
    'Retail Chain A',
    'Wholesale Distributor B',
    'Online Marketplace C',
    'Corporate Client D',
    'International Buyer E'
  ];
  
  // Generate between 20-40 invoices
  const invoiceCount = Math.floor(Math.random() * 21) + 20;
  
  for (let i = 0; i < invoiceCount; i++) {
    // Generate random date within range
    const randomDate = new Date(startDateObj.getTime() + Math.random() * (endDateObj.getTime() - startDateObj.getTime()));
    const invoiceDate = randomDate.toISOString().split('T')[0];
    
    // Generate due date (usually 30 days after invoice date)
    const dueDate = new Date(randomDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const invoiceDueDate = dueDate.toISOString().split('T')[0];
    
    // Randomly determine status based on distribution
    const statusRandom = Math.random();
    let statusIndex = 0;
    let cumulativeProbability = 0;
    
    for (let j = 0; j < statusDistribution.length; j++) {
      cumulativeProbability += statusDistribution[j];
      if (statusRandom <= cumulativeProbability) {
        statusIndex = j;
        break;
      }
    }
    
    const status = statuses[statusIndex];
    
    // Generate random amount between 500 and 10000
    const totalAmount = Math.floor(Math.random() * 9501) + 500;
    
    // Generate random items (1-5 items)
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    
    // Track total of items to ensure it matches invoice total
    let runningTotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      // For the last item, ensure we get to the total amount
      if (j === itemCount - 1) {
        const amount = totalAmount - runningTotal;
        items.push({
          description: `Product/Service ${j + 1}`,
          quantity: 1,
          unitPrice: amount,
          amount: amount
        });
      } else {
        // Otherwise random amount that doesn't exceed remaining
        const maxItemAmount = totalAmount - runningTotal - (itemCount - j - 1);
        const itemAmount = Math.floor(Math.random() * (maxItemAmount * 0.8)) + 1;
        runningTotal += itemAmount;
        
        items.push({
          description: `Product/Service ${j + 1}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          unitPrice: Math.floor(itemAmount / (Math.floor(Math.random() * 5) + 1)),
          amount: itemAmount
        });
      }
    }
    
    // Create invoice
    invoices.push({
      id: `dummy-${i + 1}`,
      invoiceNumber: `INV-2023-${1000 + i}`,
      date: invoiceDate,
      dueDate: invoiceDueDate,
      vendorName: vendors[Math.floor(Math.random() * vendors.length)],
      vendorAddress: '123 Vendor Street, Business District, City',
      customerName: customers[Math.floor(Math.random() * customers.length)],
      customerAddress: '456 Customer Avenue, Commerce Zone, City',
      totalAmount: totalAmount,
      taxAmount: Math.floor(totalAmount * 0.1), // 10% tax
      status: status,
      items: items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return invoices;
}

// Helper function to store dummy invoices in the database
async function storeDummyInvoices(invoices: Invoice[]): Promise<void> {
  // Only do this in development mode
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  try {
    for (const invoice of invoices) {
      const { items, ...invoiceData } = invoice;
      
      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { invoiceNumber: invoiceData.invoiceNumber }
      });
      
      if (!existingInvoice) {
        // Create new invoice with its items
        await prisma.invoice.create({
          data: {
            ...invoiceData,
            items: {
              create: items.map((item: InvoiceItem) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount
              }))
            }
          }
        });
      }
    }
    
    console.log(`Successfully stored ${invoices.length} dummy invoices`);
  } catch (error) {
    console.error('Error storing dummy invoices:', error);
  }
}

// Helper function to get default start date (3 months ago)
function getDefaultStartDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
}

// For POST requests to generate balance sheets with custom parameters
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Special handling for test data generation
    if (body.generateTestData) {
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Test data generation is only allowed in development environment' },
          { status: 403 }
        );
      }
      
      // Generate dummy invoices for the last 3 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      const dummyInvoices = generateDummyInvoices(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      await storeDummyInvoices(dummyInvoices);
      
      return NextResponse.json(
        { success: true, message: 'Test data generated successfully' },
        { status: 200 }
      );
    }
    
    // Validate input parameters
    const startDate = body.startDate 
      ? new Date(body.startDate) 
      : getDefaultStartDate();
    
    const endDate = body.endDate 
      ? new Date(body.endDate) 
      : new Date();
    
    // Add one day to make the end date inclusive
    endDate.setDate(endDate.getDate() + 1);

    // Fetch invoices for the period
    const invoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: true
      }
    });
    
    // If no invoices found in development, generate dummy data
    let finalInvoices = invoices;
    if (invoices.length === 0 && process.env.NODE_ENV === 'development') {
      finalInvoices = generateDummyInvoices(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Option to store dummy data
      if (body.customAssets?.shouldStoreDummyData) {
        await storeDummyInvoices(finalInvoices);
      }
    }
    
    // Generate the base balance sheet
    let balanceSheet = generateBalanceSheet(
      finalInvoices, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0]
    );
    
    // Apply custom values if provided
    if (body.customAssets) {
      balanceSheet.assets = {
        ...balanceSheet.assets,
        ...body.customAssets
      };
      
      // Recalculate summary totals
      const totalAssets = balanceSheet.assets.accountsReceivable.total +
                         (balanceSheet.assets.inventory || 0) +
                         (balanceSheet.assets.prepaidExpenses || 0);
                           
      balanceSheet.summary.totalAssets = totalAssets;
      balanceSheet.summary.netWorth = totalAssets - balanceSheet.summary.totalLiabilities;
      balanceSheet.summary.currentRatio = balanceSheet.summary.totalLiabilities > 0 
        ? totalAssets / balanceSheet.summary.totalLiabilities 
        : 0;
    }
    
    if (body.customLiabilities) {
      balanceSheet.liabilities = {
        ...balanceSheet.liabilities,
        ...body.customLiabilities
      };
      
      // Recalculate summary totals
      const totalLiabilities = balanceSheet.liabilities.accountsPayable.total +
                              (balanceSheet.liabilities.taxes?.salesTax || 0) +
                              (balanceSheet.liabilities.taxes?.otherTaxes || 0);
                              
      balanceSheet.summary.totalLiabilities = totalLiabilities;
      balanceSheet.summary.netWorth = balanceSheet.summary.totalAssets - totalLiabilities;
      balanceSheet.summary.currentRatio = totalLiabilities > 0 
        ? balanceSheet.summary.totalAssets / totalLiabilities 
        : 0;
    }
    
    // Add projections if requested
    if (body.includeProjections) {
      balanceSheet = addProjections(balanceSheet, finalInvoices);
    }
    
    return NextResponse.json({
      success: true,
      data: balanceSheet
    });
  } catch (error: unknown) {
    console.error('Error generating custom balance sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Database error';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to add financial projections to the balance sheet
function addProjections(balanceSheet: BalanceSheetData, invoices: Invoice[]): BalanceSheetData {
  // Calculate trends from invoice data
  const monthlyRevenue = calculateMonthlyRevenue(invoices);
  const collectionRate = calculateCollectionRate();
  
  // Project accounts receivable collection in next 30/60/90 days
  const projectedCollections = {
    next30Days: Math.round(balanceSheet.assets.accountsReceivable.breakdown.current * collectionRate.current),
    next60Days: Math.round(balanceSheet.assets.accountsReceivable.breakdown.overdue30 * collectionRate.overdue30),
    next90Days: Math.round(balanceSheet.assets.accountsReceivable.breakdown.overdue60 * collectionRate.overdue60),
    beyond90Days: Math.round(balanceSheet.assets.accountsReceivable.breakdown.overdue90Plus * collectionRate.overdue90Plus)
  };
  
  // Project cash flow
  const projectedCashflow = {
    inflows: projectedCollections.next30Days + projectedCollections.next60Days * 0.8 + projectedCollections.next90Days * 0.6,
    outflows: balanceSheet.liabilities.accountsPayable.total * 0.7, // Assuming 70% of AP will be paid
    net: 0 // Will calculate below
  };
  
  projectedCashflow.net = projectedCashflow.inflows - projectedCashflow.outflows;
  
  // Add projections to balance sheet
  return {
    ...balanceSheet,
    projections: {
      accountsReceivableCollections: projectedCollections,
      cashflow: projectedCashflow,
      monthlyRevenueTrend: monthlyRevenue
    }
  };
}

// Helper function to calculate monthly revenue
function calculateMonthlyRevenue(invoices: Invoice[]): Record<string, number> {
  const monthlyRevenue: Record<string, number> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyRevenue[monthKey]) {
      monthlyRevenue[monthKey] = 0;
    }
    
    monthlyRevenue[monthKey] += invoice.totalAmount;
  });
  
  return monthlyRevenue;
}

// Helper function to calculate collection rates
function calculateCollectionRate(): {
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90Plus: number;
} {
  // This would normally be calculated based on historical data
  // For dummy data, we'll use reasonable assumptions
  return {
    current: 0.9,  // 90% of current invoices will be collected
    overdue30: 0.75, // 75% of 30-day overdue will be collected
    overdue60: 0.50, // 50% of 60-day overdue will be collected
    overdue90Plus: 0.25 // 25% of 90+ day overdue will be collected
  };
} 