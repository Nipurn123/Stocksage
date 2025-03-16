'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button, Card, Badge } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeftIcon, PrinterIcon, DocumentArrowDownIcon, CreditCardIcon, PencilIcon } from '@heroicons/react/24/outline';
import ComplianceCheckbox from '@/components/invoices/ComplianceCheckbox';
import { toast } from 'react-hot-toast';
import type { Invoice } from '@/types/invoice';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch invoice');
        }
        
        setInvoice(data.data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Handle payment processing
  const handlePayNow = async () => {
    setPaymentProcessing(true);
    
    try {
      // Call the API to process payment
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process payment');
      }
      
      toast.success('Payment processed successfully');
      
      // Refresh invoice data
      setInvoice((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'paid',
          paymentStatus: 'PAID',
        };
      });
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="success">{status}</Badge>;
      case 'pending':
        return <Badge variant="warning">{status}</Badge>;
      case 'overdue':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (invoice?.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      toast.error('PDF is not available for this invoice');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {error || 'Invoice not found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              We couldn't load the invoice details. Please try again later.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.back()}>
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Invoices
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created on {formatDate(invoice.date)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!invoice.pdfUrl} onClick={handleDownloadPdf}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Invoice details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Invoice Details</h2>
              </div>
              <div>
                {getStatusBadge(invoice.status || invoice.paymentStatus || 'pending')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">From</h3>
                <p className="font-medium">{invoice.vendorName}</p>
                <p className="text-sm">{invoice.vendorAddress}</p>
                {invoice.vendorEmail && <p className="text-sm">{invoice.vendorEmail}</p>}
                {invoice.vendorPhone && <p className="text-sm">{invoice.vendorPhone}</p>}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">To</h3>
                <p className="font-medium">{invoice.customerName}</p>
                <p className="text-sm">{invoice.customerAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Invoice Number</h3>
                <p>{invoice.invoiceNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</h3>
                <p>{formatDate(invoice.date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</h3>
                <p>{formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items && invoice.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          <div>
                            <p>{item.description}</p>
                            {item.productSku && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                SKU: {item.productSku}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(invoice.totalAmount - (invoice.taxAmount || 0))}
                    </span>
                  </div>
                  {invoice.taxAmount && invoice.taxAmount > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(invoice.taxAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-base font-bold">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold border-b pb-4 mb-4">Payment & Status</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                  <div className="flex items-center mt-1">
                    {getStatusBadge(invoice.status || invoice.paymentStatus || 'pending')}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Amount</h3>
                  <p className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                {invoice.paymentTerms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Terms</h3>
                    <p>{invoice.paymentTerms}</p>
                  </div>
                )}
                <div className="pt-4">
                  {['pending', 'PENDING'].includes(invoice.status || invoice.paymentStatus || '') ? (
                    <Button 
                      className="w-full" 
                      onClick={handlePayNow}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        This invoice has been paid.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold border-b pb-4 mb-4">Compliance</h2>
              <div className="space-y-4">
                <ComplianceCheckbox
                  invoiceId={invoiceId}
                  initialStatus={invoice.isCompliant || false}
                  complianceNotes={invoice.complianceNotes || ''}
                />
                
                {invoice.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 