import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripeService } from '@/lib/stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      );
    }

    // Verify that this is a genuine Stripe webhook by validating the signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.marked_uncollectible':
        await handleInvoiceMarkedUncollectible(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.voided':
        await handleInvoiceVoided(event.data.object as Stripe.Invoice);
        break;
        
      // Customer events
      case 'customer.created':
      case 'customer.updated':
        await syncCustomerData(event.data.object as Stripe.Customer);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler functions for specific events

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.id) return;
  
  try {
    // Update the invoice status in our database
    await stripeService.updateInvoiceStatus(invoice.id, 'PAID');
    
    console.log(`Payment succeeded for invoice ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment succeeded webhook:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.id) return;
  
  try {
    // Update the invoice status in our database
    await stripeService.updateInvoiceStatus(invoice.id, 'FAILED');
    
    console.log(`Payment failed for invoice ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment failed webhook:', error);
  }
}

async function handleInvoiceMarkedUncollectible(invoice: Stripe.Invoice) {
  if (!invoice.id) return;
  
  try {
    // Update the invoice status in our database
    await stripeService.updateInvoiceStatus(invoice.id, 'CANCELLED');
    
    console.log(`Invoice ${invoice.id} marked as uncollectible`);
  } catch (error) {
    console.error('Error handling uncollectible invoice webhook:', error);
  }
}

async function handleInvoiceVoided(invoice: Stripe.Invoice) {
  if (!invoice.id) return;
  
  try {
    // Update the invoice status in our database
    await stripeService.updateInvoiceStatus(invoice.id, 'CANCELLED');
    
    console.log(`Invoice ${invoice.id} voided`);
  } catch (error) {
    console.error('Error handling voided invoice webhook:', error);
  }
}

async function syncCustomerData(customer: Stripe.Customer) {
  if (!customer.id || !customer.email) return;
  
  try {
    // Check if customer exists in our database
    const dbCustomer = await prisma.customer.findUnique({
      where: { stripeCustomerId: customer.id },
    });
    
    if (dbCustomer) {
      // Update existing customer
      await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: {
          name: customer.name || dbCustomer.name,
          email: customer.email,
          phone: customer.phone || dbCustomer.phone,
          address: customer.address?.line1 || dbCustomer.address,
        },
      });
    } else {
      // Find by email or create new customer
      const customerByEmail = await prisma.customer.findUnique({
        where: { email: customer.email },
      });
      
      if (customerByEmail) {
        // Link to Stripe customer
        await prisma.customer.update({
          where: { id: customerByEmail.id },
          data: { stripeCustomerId: customer.id },
        });
      } else {
        // Create new customer
        await prisma.customer.create({
          data: {
            name: customer.name || 'Unnamed Customer',
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address?.line1 || null,
            stripeCustomerId: customer.id,
          },
        });
      }
    }
    
    console.log(`Customer data synced for ${customer.id}`);
  } catch (error) {
    console.error('Error syncing customer data:', error);
  }
} 