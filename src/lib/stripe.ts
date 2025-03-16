import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateInvoiceParams {
  customer: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    productSku?: string;
  }[];
  dueDate?: Date;
  notes?: string;
  customFields?: Record<string, string>;
}

export const stripeService = {
  /**
   * Create or retrieve a customer in Stripe
   */
  async getOrCreateCustomer(customerData: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  }): Promise<{ stripeCustomerId: string; dbCustomerId: string }> {
    // First, check if customer exists in our database
    let dbCustomer = await prisma.customer.findUnique({
      where: { email: customerData.email },
    });

    let stripeCustomerId: string;

    if (dbCustomer?.stripeCustomerId) {
      // Customer exists, return Stripe ID
      stripeCustomerId = dbCustomer.stripeCustomerId;
    } else {
      // Create customer in Stripe
      const stripeCustomer = await stripe.customers.create({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address
          ? {
              line1: customerData.address,
            }
          : undefined,
      });

      // Create or update in database
      if (dbCustomer) {
        dbCustomer = await prisma.customer.update({
          where: { id: dbCustomer.id },
          data: { stripeCustomerId: stripeCustomer.id },
        });
      } else {
        dbCustomer = await prisma.customer.create({
          data: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            stripeCustomerId: stripeCustomer.id,
          },
        });
      }

      stripeCustomerId = stripeCustomer.id;
    }

    return { stripeCustomerId, dbCustomerId: dbCustomer.id };
  },

  /**
   * Create an invoice in Stripe and our database
   */
  async createInvoice(params: CreateInvoiceParams): Promise<{
    invoiceId: string;
    stripeInvoiceId: string;
    invoiceNumber: string;
    pdfUrl: string | null;
  }> {
    const { customer, items, dueDate, notes, customFields } = params;
    
    // Step 1: Create or get customer
    const { stripeCustomerId, dbCustomerId } = await this.getOrCreateCustomer(customer);

    // Step 2: Create invoice items in Stripe
    const lineItems = await Promise.all(
      items.map(async (item) => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.description,
              metadata: item.productSku ? { sku: item.productSku } : undefined,
            },
            unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
            product: 'prod_default', // Add a default product ID
          },
          quantity: item.quantity,
        };
      })
    );

    // Step 3: Create a draft invoice in Stripe
    const stripeInvoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: dueDate 
        ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 30,
      description: notes,
      metadata: customFields,
    });

    // Step 4: Add line items to the invoice
    for (const item of lineItems) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: stripeInvoice.id,
        price_data: item.price_data,
        quantity: item.quantity,
      });
    }

    // Step 5: Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    
    // Step 6: Send the invoice
    await stripe.invoices.sendInvoice(stripeInvoice.id);

    // Step 7: Create a record in our database
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    
    const dbInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalizedInvoice.number || `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vendorName: 'Your Company Name', // Replace with actual company name
        vendorAddress: 'Your Company Address', // Replace with actual address
        customerName: customer.name,
        customerAddress: customer.address || '',
        vendorEmail: 'your-email@example.com', // Replace with actual email
        vendorPhone: '123-456-7890', // Replace with actual phone
        totalAmount,
        taxAmount: finalizedInvoice.tax ? finalizedInvoice.tax / 100 : 0, // Convert from cents
        paymentTerms: `Due in ${dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30} days`,
        notes: notes,
        stripeInvoiceId: stripeInvoice.id,
        stripeCustomerId,
        paymentStatus: 'PENDING',
        pdfUrl: finalizedInvoice.invoice_pdf || null,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            productSku: item.productSku,
          })),
        },
      },
    });

    return {
      invoiceId: dbInvoice.id,
      stripeInvoiceId: stripeInvoice.id,
      invoiceNumber: finalizedInvoice.number || `INV-${Date.now()}`,
      pdfUrl: finalizedInvoice.invoice_pdf || null,
    };
  },

  /**
   * Get invoice details from Stripe
   */
  async getInvoice(stripeInvoiceId: string) {
    return stripe.invoices.retrieve(stripeInvoiceId);
  },

  /**
   * Update invoice payment status based on Stripe webhook
   */
  async updateInvoiceStatus(stripeInvoiceId: string, status: 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED') {
    const dbInvoice = await prisma.invoice.findUnique({
      where: { stripeInvoiceId },
    });

    if (!dbInvoice) {
      throw new Error(`Invoice with Stripe ID ${stripeInvoiceId} not found`);
    }

    await prisma.invoice.update({
      where: { id: dbInvoice.id },
      data: { paymentStatus: status },
    });

    // If paid, also create a payment record
    if (status === 'PAID') {
      const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId);
      
      await prisma.payment.create({
        data: {
          amount: stripeInvoice.total ? stripeInvoice.total / 100 : 0, // Convert from cents
          currency: stripeInvoice.currency || 'USD',
          status: 'PAID',
          paymentMethod: stripeInvoice.payment_intent 
            ? 'Stripe' 
            : 'Manual',
          transactionId: stripeInvoice.payment_intent as string,
          invoiceId: dbInvoice.id,
          customerId: dbInvoice.stripeCustomerId 
            ? (await prisma.customer.findUnique({ where: { stripeCustomerId: dbInvoice.stripeCustomerId } }))?.id 
            : undefined,
          paymentDate: new Date(),
        },
      });
    }

    return dbInvoice;
  },
}; 