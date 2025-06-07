import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  productSku?: string;
  taxRate?: number;
  taxAmount?: number;
}

interface InvoiceProps {
  id?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerPhone?: string;
  companyName: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyLogo?: string;
  items: InvoiceItem[];
  notes?: string;
  paymentTerms?: string;
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  status?: string;
  isPrintable?: boolean;
}

const ProfessionalInvoiceTemplate: React.FC<InvoiceProps> = ({
  invoiceNumber,
  date,
  dueDate,
  customerName,
  customerEmail,
  customerAddress,
  customerPhone,
  companyName,
  companyAddress,
  companyEmail,
  companyPhone,
  companyLogo,
  items,
  notes,
  paymentTerms,
  subtotal,
  taxAmount = 0,
  totalAmount,
  status,
  isPrintable = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getBadgeColorClass = () => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-8 ${isPrintable ? 'bg-white' : 'bg-white dark:bg-gray-900 shadow-lg rounded-lg'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10">
        <div className="mb-6 md:mb-0">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt={`${companyName} logo`} 
              className="h-12 mb-4 object-contain"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{companyName}</h1>
          )}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {companyAddress && <p>{companyAddress}</p>}
            {companyEmail && <p>{companyEmail}</p>}
            {companyPhone && <p>{companyPhone}</p>}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">INVOICE</h1>
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-x-4">
              <span className="text-gray-600 dark:text-gray-400 text-right">Invoice Number:</span>
              <span className="font-medium text-right">{invoiceNumber}</span>
              
              <span className="text-gray-600 dark:text-gray-400 text-right">Invoice Date:</span>
              <span className="font-medium text-right">{formatDate(date)}</span>
              
              <span className="text-gray-600 dark:text-gray-400 text-right">Due Date:</span>
              <span className="font-medium text-right">{formatDate(dueDate)}</span>
              
              {status && (
                <>
                  <span className="text-gray-600 dark:text-gray-400 text-right">Status:</span>
                  <span className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColorClass()}`}>
                      {status.toUpperCase()}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Client Info */}
      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-8">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bill To:</h2>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{customerName}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {customerAddress && <p>{customerAddress}</p>}
          {customerEmail && <p>{customerEmail}</p>}
          {customerPhone && <p>{customerPhone}</p>}
        </div>
      </div>
      
      {/* Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left">
              <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Item</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Qty</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Unit Price</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item, index) => (
              <tr key={item.id || index} className="dark:text-white">
                <td className="py-3 px-4">
                  <div>
                    <div className="text-gray-900 dark:text-white">{item.description}</div>
                    {item.productSku && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.productSku}</div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2 md:w-1/3">
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
          
          {taxAmount > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Tax:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <span className="text-gray-800 dark:text-gray-200">Total:</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
      
      {/* Notes & Payment Terms */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {paymentTerms && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{paymentTerms}</p>
          </div>
        )}
        
        {notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{notes}</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default ProfessionalInvoiceTemplate; 