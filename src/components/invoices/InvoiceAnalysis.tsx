'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Clock, Copy } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { InvoiceAnalysisResult } from '@/types/invoice';

interface InvoiceAnalysisProps {
  result: InvoiceAnalysisResult | null;
  onCopy?: () => void;
  onCreateInvoice?: () => void;
}

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (err) {
    return dateString;
  }
}

export default function InvoiceAnalysis({ result, onCopy, onCreateInvoice }: InvoiceAnalysisProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <Clock className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Waiting for Analysis</p>
        <p className="text-sm mt-2">Upload and scan an invoice to see results here.</p>
      </div>
    );
  }
  
  // Error state
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Analysis Failed</p>
        <p className="text-sm mt-2">{result.error || 'An unknown error occurred'}</p>
      </div>
    );
  }
  
  // Empty data state
  if (!result.data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-orange-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No Data Extracted</p>
        <p className="text-sm mt-2">The system couldn't extract meaningful data from this invoice.</p>
      </div>
    );
  }

  const { data } = result;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="font-medium">Extraction Complete</span>
        </div>
        <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
          {Math.round((result.confidence || 0) * 100)}% Confidence
        </div>
      </div>
      
      {/* Basic Info Card */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium">Basic Information</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Invoice Number</p>
            <p className="font-medium">{data.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date</p>
            <p className="font-medium">{formatDate(data.date)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Due Date</p>
            <p className="font-medium">{formatDate(data.dueDate)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Total Amount</p>
            <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(data.totalAmount)}</p>
          </div>
        </div>
      </div>
      
      {/* Vendor & Customer Card */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium">Vendor & Customer</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 text-sm border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-gray-500 mb-2">Vendor</p>
            <p className="font-medium">{data.vendorName}</p>
            <p className="text-gray-500 text-xs mt-1">{data.vendorAddress}</p>
            {data.vendorEmail && <p className="text-gray-500 text-xs mt-1">Email: {data.vendorEmail}</p>}
            {data.vendorPhone && <p className="text-gray-500 text-xs mt-1">Phone: {data.vendorPhone}</p>}
          </div>
          <div>
            <p className="text-gray-500 mb-2">Customer</p>
            <p className="font-medium">{data.customerName}</p>
            <p className="text-gray-500 text-xs mt-1">{data.customerAddress}</p>
          </div>
        </div>
      </div>
    
      {/* Line Items */}
      {data.items && data.items.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium">Invoice Items</h3>
            <p className="text-xs text-gray-500">{data.items.length} items</p>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{item.description}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">{item.quantity}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th colSpan={3} className="px-3 py-2 text-sm text-right font-medium">Subtotal:</th>
                  <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                    {formatCurrency(data.items.reduce((sum, item) => sum + (item.amount || 0), 0))}
                  </td>
                </tr>
                {data.taxAmount !== undefined && (
                  <tr>
                    <th colSpan={3} className="px-3 py-2 text-sm text-right font-medium">Tax:</th>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                      {formatCurrency(data.taxAmount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <th colSpan={3} className="px-3 py-2 text-sm text-right font-medium">Total:</th>
                  <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-gray-100 font-bold">
                    {formatCurrency(data.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      
      {/* Additional Details */}
      {(data.paymentTerms || data.notes) && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium">Additional Details</h3>
          </div>
          <div className="p-4 space-y-3 text-sm">
            {data.paymentTerms && (
              <div>
                <p className="text-gray-500 mb-1">Payment Terms</p>
                <p>{data.paymentTerms}</p>
              </div>
            )}
            {data.notes && (
              <div>
                <p className="text-gray-500 mb-1">Notes</p>
                <p>{data.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex space-x-3">
        {onCreateInvoice && (
          <Button 
            onClick={onCreateInvoice} 
            className="flex-1"
          >
            Create Invoice
          </Button>
        )}
        {onCopy && (
          <Button 
            variant="outline"
            onClick={onCopy}
            className="flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Data
          </Button>
        )}
      </div>
      
      {/* Database Info */}
      {result.invoiceId && (
        <div className="text-xs text-gray-500 mt-2">
          <p>Saved to database with ID: {result.invoiceId}</p>
        </div>
      )}
      
      {result.dbError && (
        <div className="text-xs text-red-500 mt-2">
          <p>{result.dbError}</p>
        </div>
      )}
    </div>
  );
} 