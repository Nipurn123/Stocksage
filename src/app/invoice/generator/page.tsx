'use client';

import React, { useState } from 'react';
import { Plus, FileText, Edit, Trash2, Download, MailOpen, Printer, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
          <h1 className="text-2xl font-bold tracking-tight">GST Invoice Generator</h1>
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
            
            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                id="businessAddress"
                value={businessDetails.address}
                onChange={(e) => setBusinessDetails({...businessDetails, address: e.target.value})}
                rows={2}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
          </div>
          
          <h2 className="text-lg font-medium mt-6 mb-4">Customer Details</h2>
          <div className="space-y-4">
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
                GSTIN (optional)
              </label>
              <input
                type="text"
                id="customerGstin"
                value={customerDetails.gstin}
                onChange={(e) => setCustomerDetails({...customerDetails, gstin: e.target.value})}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                id="customerAddress"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                rows={2}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
              />
            </div>
          </div>
        </Card>
        
        {/* Invoice Items */}
        <Card className="p-6 col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Invoice Items</h2>
            <Button onClick={addItem} variant="outline" size="sm" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">HSN Code</th>
                  <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price (₹)</th>
                  <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GST %</th>
                  <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total (₹)</th>
                  <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.hsnCode}
                        onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm"
                        placeholder="HSN"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-16 rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm text-right"
                        title="Quantity"
                        aria-label={`Quantity for ${item.description}`}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-24 rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm text-right"
                        title="Unit price"
                        aria-label={`Unit price for ${item.description}`}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={item.gstRate}
                        onChange={(e) => updateItem(item.id, 'gstRate', parseInt(e.target.value))}
                        className="w-20 rounded-md border border-gray-200 dark:border-gray-700 py-1 px-2 text-sm text-right"
                        title="GST Rate"
                        aria-label={`GST rate for ${item.description}`}
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2 text-right">
                      ₹{((item.quantity * item.price) * (1 + item.gstRate / 100)).toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove item"
                        aria-label={`Remove ${item.description}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-60">
              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium">Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {[5, 12, 18, 28].map(rate => {
                const gstAmount = calculateGST(rate);
                if (gstAmount <= 0) return null;
                
                return (
                  <div key={rate} className="flex justify-between py-2 text-sm">
                    <span>GST {rate}%:</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                );
              })}
              
              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Notes & Terms */}
          <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
                placeholder="Add any notes here..."
              />
            </div>
            
            <div>
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Terms & Conditions
              </label>
              <textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-sm"
                placeholder="Add terms and conditions here..."
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" className="flex items-center">
              <Printer className="h-4 w-4 mr-2" />
              Print Preview
            </Button>
            <Button variant="outline" className="flex items-center">
              <MailOpen className="h-4 w-4 mr-2" />
              Email Invoice
            </Button>
            <Button onClick={generateInvoice} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </Card>
      </div>
      
      {/* GST Information */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">GST Invoice Requirements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-sm mb-2">Required Details</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Supplier's legal name, address & GSTIN</li>
              <li>• Recipient's legal name, address & GSTIN</li>
              <li>• Sequential invoice number & date</li>
              <li>• Place of supply & state code</li>
              <li>• HSN codes for all products</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-2">Textile HSN Codes</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 5007: Silk fabrics & sarees</li>
              <li>• 5208: Cotton fabrics</li>
              <li>• 6001-6006: Knitted fabrics</li>
              <li>• 6101-6117: Knitted garments</li>
              <li>• 6201-6212: Woven garments</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-2">GST Rates for Textiles</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 5%: Most natural fabrics & traditional garments</li>
              <li>• 12%: Garments above ₹1000, certain synthetic fabrics</li>
              <li>• 18%: Certain technical textiles & specialty items</li>
              <li>• Exempted: Handloom items (specify on invoice)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 