import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define the invoice template type
type InvoiceTemplateType = {
  description: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  notes: string;
  paymentTerms: string;
  status: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};

// Define types for our templates record
type TemplateKey = 'standard' | 'premium' | 'maintenance' | 'consulting' | 'hardware';

// Define a few sample invoice types with rich data
const INVOICE_TEMPLATES: Record<TemplateKey, InvoiceTemplateType> = {
  standard: {
    description: 'Standard Services Package',
    companyName: 'DigitalEdge Solutions',
    companyEmail: 'billing@digitaledge.com',
    companyPhone: '(415) 555-1234',
    companyAddress: '123 Tech Plaza, Suite 400, San Francisco, CA 94105',
    notes: 'Thank you for your business! Payment is due within 30 days.',
    paymentTerms: 'Net 30',
    status: 'DRAFT',
    items: [
      {
        description: 'Website Maintenance - Monthly',
        quantity: 1,
        unitPrice: 299.99
      },
      {
        description: 'SSL Certificate - 1 Year',
        quantity: 1,
        unitPrice: 79.99
      },
      {
        description: 'Content Updates - Standard Package',
        quantity: 1,
        unitPrice: 120.00
      }
    ]
  },
  premium: {
    description: 'Premium Enterprise Solution',
    companyName: 'CloudForge Technologies',
    companyEmail: 'accounts@cloudforge.tech',
    companyPhone: '(650) 555-7890',
    companyAddress: '555 Enterprise Way, Building B, Palo Alto, CA 94301',
    notes: 'Enterprise service agreement includes 24/7 technical support. Payment terms as specified in the master service agreement.',
    paymentTerms: 'Net 45',
    status: 'PENDING',
    items: [
      {
        description: 'Enterprise Cloud Infrastructure - Monthly Subscription',
        quantity: 1,
        unitPrice: 799.99
      },
      {
        description: 'Dedicated Technical Account Manager',
        quantity: 1,
        unitPrice: 249.99
      },
      {
        description: 'Multi-Region Backup Service',
        quantity: 1,
        unitPrice: 149.99
      },
      {
        description: 'Advanced Security Package - 100 Endpoints',
        quantity: 1,
        unitPrice: 599.99
      }
    ]
  },
  maintenance: {
    description: 'IT Support & Maintenance',
    companyName: 'TechCare Services',
    companyEmail: 'support@techcare.io',
    companyPhone: '(510) 555-4321',
    companyAddress: '789 Maintenance Blvd, Oakland, CA 94612',
    notes: 'Preventative maintenance performed on schedule. Next service date: 6/15/2023',
    paymentTerms: 'Net 15',
    status: 'PAID',
    items: [
      {
        description: 'Workstation Maintenance - 25 Units',
        quantity: 25,
        unitPrice: 45.00
      },
      {
        description: 'Server Maintenance - 2 Units',
        quantity: 2,
        unitPrice: 125.00
      },
      {
        description: 'Network Equipment Check - 8 Hours',
        quantity: 8,
        unitPrice: 85.00
      },
      {
        description: 'Software Updates & Patches',
        quantity: 1,
        unitPrice: 175.00
      }
    ]
  },
  consulting: {
    description: 'Business Strategy Consulting',
    companyName: 'Insight Consulting Group',
    companyEmail: 'invoices@insightcg.com',
    companyPhone: '(415) 555-9876',
    companyAddress: '1250 Market Street, 10th Floor, San Francisco, CA 94103',
    notes: 'Phase 1 of 3 complete. Next workshop scheduled for next quarter.',
    paymentTerms: 'Net 30',
    status: 'PENDING',
    items: [
      {
        description: 'Strategic Planning Workshop - Senior Consultant',
        quantity: 16,
        unitPrice: 275.00
      },
      {
        description: 'Market Analysis Report',
        quantity: 1,
        unitPrice: 1200.00
      },
      {
        description: 'Competitor Analysis',
        quantity: 1,
        unitPrice: 950.00
      },
      {
        description: 'Executive Presentation Development',
        quantity: 1,
        unitPrice: 750.00
      }
    ]
  },
  hardware: {
    description: 'IT Equipment Procurement',
    companyName: 'NextGen Hardware Solutions',
    companyEmail: 'orders@nextgenhw.com',
    companyPhone: '(408) 555-2468',
    companyAddress: '350 Technology Drive, San Jose, CA 95110',
    notes: 'All equipment includes standard manufacturer warranty. Extended warranties available upon request.',
    paymentTerms: 'Due on Receipt',
    status: 'PENDING',
    items: [
      {
        description: 'ThinkPad X1 Carbon Laptop - i7/32GB/1TB',
        quantity: 4,
        unitPrice: 1899.99
      },
      {
        description: 'Dell UltraSharp 27" 4K Monitor',
        quantity: 8,
        unitPrice: 549.99
      },
      {
        description: 'Wireless Keyboard and Mouse Combo',
        quantity: 4,
        unitPrice: 79.99
      },
      {
        description: 'USB-C Docking Station',
        quantity: 4,
        unitPrice: 189.99
      },
      {
        description: 'Setup & Configuration Service',
        quantity: 4,
        unitPrice: 125.00
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters to determine invoice type
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type') || getRandomType();
    const type = isValidType(typeParam) ? typeParam : 'standard';
    
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated - for development, allow without session
    if (!session?.user) {
      // For development convenience, proceed without authentication
      if (process.env.NODE_ENV !== 'development') {
        // In production, require authentication
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Get user ID (use session or find first user in development)
    let userId = session?.user?.id;
    if (!userId) {
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'No users found to assign invoices' },
          { status: 400 }
        );
      }
      userId = user.id;
    }

    // Get or create a customer for the invoice
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: 'StockSage Inc.',
          email: 'finance@stocksage.com',
          address: '456 Business Plaza, Suite 200, San Francisco, CA 94107',
          userId: userId,
        }
      });
    }

    // Get template data
    const template = INVOICE_TEMPLATES[type];
    
    // Generate a unique invoice number with a prefix based on type
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${type.toUpperCase().slice(0, 3)}-${timestamp}`;

    // Calculate total amount based on items
    const totalBeforeTax = template.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.085; // 8.5% tax rate
    const taxAmount = Math.round(totalBeforeTax * taxRate * 100) / 100;
    const totalAmount = Math.round((totalBeforeTax + taxAmount) * 100) / 100;

    // Create a sample invoice with all required fields
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
        totalAmount,
        taxAmount,
        paymentTerms: template.paymentTerms,
        notes: template.notes,
        status: template.status,
        paymentStatus: template.status === 'PAID' ? 'PAID' : 'PENDING',
        source: 'SAMPLE',
        lastUpdated: new Date(),
        userId: userId,
      }
    });

    // Add sample invoice items
    for (const item of template.items) {
      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Sample ${type} invoice created successfully`,
      invoiceId: invoice.id,
      type,
      company: {
        name: template.companyName,
        email: template.companyEmail,
        phone: template.companyPhone,
        address: template.companyAddress
      }
    });
  } catch (error) {
    console.error('Error creating sample invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : 'An error occurred while creating sample invoice'
      },
      { status: 500 }
    );
  }
}

// Helper function to get a random invoice type
function getRandomType(): TemplateKey {
  const types = Object.keys(INVOICE_TEMPLATES) as TemplateKey[];
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
}

// Helper function to validate the type parameter
function isValidType(type: string): type is TemplateKey {
  return Object.keys(INVOICE_TEMPLATES).includes(type);
} 