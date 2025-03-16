'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import CreateInvoiceForm from '@/components/invoices/CreateInvoiceForm';

export default function CreateInvoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/invoice">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Create a professional invoice for your textile business
          </p>
        </div>
      </div>
      
      <CreateInvoiceForm />
    </div>
  );
} 