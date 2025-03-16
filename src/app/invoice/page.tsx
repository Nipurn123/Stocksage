'use client';

import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  Camera, 
  CreditCard, 
  FileCheck, 
  Receipt, 
  Upload, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WeaveMitra Invoicing</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage and analyze your textile business invoices
          </p>
        </div>
        <Link href="/invoice/create">
          <Button className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/invoice/create" className="group">
          <Card className="p-6 h-full transition-all group-hover:shadow-md group-hover:border-indigo-300 dark:group-hover:border-indigo-700">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Regular Invoicing
                  <ArrowRight className="h-4 w-4 inline ml-2 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create professional invoices for your textile business with our easy-to-use invoice creator.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Customizable invoice templates
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Professional PDF generation
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Email invoices directly to customers
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/invoice/generator" className="group">
          <Card className="p-6 h-full transition-all group-hover:shadow-md group-hover:border-emerald-300 dark:group-hover:border-emerald-700">
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3">
                <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  GST Invoice Generator
                  <ArrowRight className="h-4 w-4 inline ml-2 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create GST-compliant invoices with automatic tax calculation and HSN codes for textile products.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Automatic GST calculation
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Built-in textile HSN codes
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Tax-compliant invoice formats
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/invoice/scanner" className="group">
          <Card className="p-6 h-full transition-all group-hover:shadow-md group-hover:border-purple-300 dark:group-hover:border-purple-700">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                <Camera className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  AI Invoice Scanner
                  <ArrowRight className="h-4 w-4 inline ml-2 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload and scan invoice images to automatically extract key information using our AI.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Automatic data extraction
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Support for multiple file formats
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Create invoices from scanned data
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/invoice/stripe" className="group">
          <Card className="p-6 h-full transition-all group-hover:shadow-md group-hover:border-blue-300 dark:group-hover:border-blue-700">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Stripe Invoicing
                  <ArrowRight className="h-4 w-4 inline ml-2 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage recurring invoices and subscription billing for your textile business with Stripe.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Subscription management
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    Automated payment collection
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    International currency support
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Invoices Section */}
      <div>
        <h2 className="text-lg font-medium mb-4">Recent Invoices</h2>
        <Card className="p-6">
          <div className="text-center py-12">
            <div className="mb-4">
              <Upload className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Invoices Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              You haven't created any invoices yet. Start by creating your first invoice or import existing ones.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/invoice/create">
                <Button className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
              <Link href="/invoice/scanner">
                <Button variant="outline" className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Invoice
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Compliance Section */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-none">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Stay Compliant with GST Regulations</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our invoicing system helps textile businesses stay compliant with the latest GST regulations, including correct HSN codes and tax rates.
            </p>
            <Link href="/invoice/generator">
              <Button variant="outline" className="flex items-center">
                Learn More <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="w-full md:w-1/3 flex-shrink-0">
            <img 
              src="/placeholder-image.jpg" 
              alt="GST Compliance" 
              className="w-full h-auto rounded-lg shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3EGST Compliance%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
} 