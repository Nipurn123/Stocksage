import React from 'react';
import { Metadata } from 'next';
import CreateInvoiceForm from '@/components/invoices/CreateInvoiceForm';

export const metadata: Metadata = {
  title: 'Create Invoice | StockSage',
  description: 'Create a new invoice with automated Stripe integration',
};

export default function CreateInvoicePage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground">
          Create a professional invoice to send to your customers with automated payment processing.
        </p>
      </div>
      
      <CreateInvoiceForm />
    </div>
  );
} 