import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import InvoiceForm from '@/components/financial/InvoiceForm';

export const metadata: Metadata = {
  title: 'Create Invoice - StockSage',
  description: 'Create a new invoice with Stripe integration',
};

export default function CreateInvoicePage() {
  return (
    <div className="flex flex-col space-y-8">
      <PageHeader
        title="Create New Invoice"
        description="Generate and send a professional invoice to your customers"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/financial/automated-invoicing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
        }
      />

      <Card>
        <div className="p-1">
          <InvoiceForm />
        </div>
      </Card>
    </div>
  );
} 