'use client';

import React, { useState } from 'react';
import { Plus, FileText, Edit, Trash2, Download, MailOpen, Printer, Save, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';

interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  price: number;
  gstRate: number;
  discount: number;
}

interface BusinessDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  email: string;
  phone: string;
}

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2023-0001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Handwoven Silk Chanderi Saree',
      hsnCode: '5007',
      quantity: 2,
      price: 7500,
      gstRate: 5,
      discount: 0
    }
  ]);
  
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: 'WeaveMitra Textiles',
    address: '45, Craft Market, Textile Hub',
    city: 'Chanderi',
    state: 'Madhya Pradesh',
    pincode: '473446',
    gstin: '23AABCT1234A1Z5',
    email: 'orders@weavemitra.com',
    phone: '+91 98765 43210'
  });
  
  const [customerDetails, setCustomerDetails] = useState<BusinessDetails>({
    name: 'Ethnic Retail Store',
    address: '78, Fashion Street, Retail Zone',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    gstin: '27AADFR9876B1Z3',
    email: 'purchases@ethnicretail.com',
    phone: '+91 98765 12345'
  });
  
  const [notes, setNotes] = useState('Thank you for supporting Indian handloom artisans!');
  const [terms, setTerms] = useState('Payment due within 30 days. Late payments are subject to 1.5% monthly interest.');
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const itemTotal = item.quantity * item.price;
      const discountAmount = (itemTotal * item.discount) / 100;
      return total + (itemTotal - discountAmount);
    }, 0);
  };
  
  // Calculate GST
  const calculateGST = (rate: number) => {
    return items.reduce((total, item) => {
      if (item.gstRate === rate) {
        const itemTotal = item.quantity * item.price;
        const discountAmount = (itemTotal * item.discount) / 100;
        const afterDiscount = itemTotal - discountAmount;
        return total + (afterDiscount * rate) / 100;
      }
      return total;
    }, 0);
  };
  
  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gst = [5, 12, 18, 28].reduce((total, rate) => {
      return total + calculateGST(rate);
    }, 0);
    return subtotal + gst;
  };
  
  // Add new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: (items.length + 1).toString(),
      description: '',
      hsnCode: '',
      quantity: 1,
      price: 0,
      gstRate: 5,
      discount: 0
    };
    
    setItems([...items, newItem]);
  };
  
  // Update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };
  
  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Generate and download invoice
  const generateInvoice = () => {
    // In a real application, this would generate a PDF or call an API
    alert('Invoice generated and ready for download');
  };
  
  // Save as draft
  const saveDraft = () => {
    // In a real application, this would save to a database
    alert('Invoice saved as draft');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">GST Invoice Generator</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Create professional GST-compliant invoices for your textile business
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveDraft} variant="outline" className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={generateInvoice} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <Card className="p-6 col-span-1">
          <h2 className="text-lg font-medium mb-4">Invoice Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                id="invoiceDate"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
          </div>
          
          <h2 className="text-lg font-medium mt-6 mb-4">Your Business Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                value={businessDetails.name}
                onChange={(e) => setBusinessDetails({...businessDetails, name: e.target.value})}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GSTIN
              </label>
              <input
                type="text"
                id="gstin"
                value={businessDetails.gstin}
                onChange={(e) => setBusinessDetails({...businessDetails, gstin: e.target.value})}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Customer Details and Items */}
        <Card className="p-6 col-span-1 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                id="customerName"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="customerGstin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer GSTIN
              </label>
              <input
                type="text"
                id="customerGstin"
                value={customerDetails.gstin}
                onChange={(e) => setCustomerDetails({...customerDetails, gstin: e.target.value})}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
          </div>

          <h2 className="text-lg font-medium mb-4">Invoice Items</h2>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">HSN Code</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GST %</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => {
                    const itemTotal = item.quantity * item.price;
                    const discountAmount = (itemTotal * item.discount) / 100;
                    const afterDiscount = itemTotal - discountAmount;
                    const gstAmount = (afterDiscount * item.gstRate) / 100;
                    const totalWithGst = afterDiscount + gstAmount;
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                            placeholder="Item description"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.hsnCode}
                            onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                            className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                            placeholder="HSN Code"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                            className="w-16 rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                            min="1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                            className="w-24 rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.gstRate}
                            onChange={(e) => updateItem(item.id, 'gstRate', parseInt(e.target.value))}
                            className="rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-sm font-medium">
                          ₹{totalWithGst.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <Button onClick={addItem} variant="outline" className="flex items-center" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {[5, 12, 18, 28].map(rate => {
                const gstAmount = calculateGST(rate);
                if (gstAmount > 0) {
                  return (
                    <div key={rate} className="flex justify-between text-sm mb-1">
                      <span>GST @{rate}%:</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                  );
                }
                return null;
              })}
              
              <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 