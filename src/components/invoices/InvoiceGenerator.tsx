'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Trash2, 
  Download, 
  Send, 
  Copy, 
  Save, 
  FileCheck,
  AlertCircle,
  Info,
  Calendar,
  DollarSign,
  User,
  Building,
  Hash,
  CheckCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

// Define types
type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  hsn: string; // HSN code for Indian GST
  gstRate: number;
  discount: number;
};

type InvoiceTemplate = {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  termsAndConditions: string[];
};

type Customer = {
  id: string;
  name: string;
  gstin?: string; // GST Identification Number
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  phone: string;
};

// Mock data
const availableTemplates: InvoiceTemplate[] = [
  {
    id: 'template-1',
    name: 'WeaveMitra Standard',
    logoUrl: '/logo.png',
    primaryColor: '#4f46e5',
    secondaryColor: '#e5e7eb',
    footerText: 'Thank you for your business!',
    termsAndConditions: [
      'Payment is due within 30 days',
      'Goods once sold will not be taken back or exchanged',
      'All disputes are subject to Hyderabad jurisdiction only',
      'This is a computer-generated invoice and does not require a signature'
    ]
  },
  {
    id: 'template-2',
    name: 'Traditional Elegance',
    logoUrl: '/logo-alt.png',
    primaryColor: '#854d0e',
    secondaryColor: '#fef3c7',
    footerText: 'We appreciate your business and trust in our artisanal crafts.',
    termsAndConditions: [
      'Payment to be made by bank transfer only',
      'Delivery within 7 working days after payment confirmation',
      'Colors may vary slightly due to the nature of natural dyes'
    ]
  }
];

const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ethnic Emporium',
    gstin: '27AAPFU0939F1ZV',
    address: '42 Fashion Street, Textile Market',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    email: 'orders@ethnicemporium.com',
    phone: '+91 98765 43210'
  },
  {
    id: 'cust-2',
    name: 'Traditional Trends',
    gstin: '29AARCS3114Q1ZP',
    address: '23 Craft Avenue, Handloom Complex',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    email: 'purchase@traditionaltrends.in',
    phone: '+91 87654 32109'
  },
  {
    id: 'cust-3',
    name: 'Heritage Boutique',
    gstin: '07AAACH7409R1ZM',
    address: '78 Cultural Lane, Textile Hub',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    email: 'orders@heritageboutique.com',
    phone: '+91 76543 21098'
  }
];

// GST rates applicable for textile items
const gstRates = [0, 5, 12, 18, 28];

// HSN codes commonly used in textile industry
const hsnCodes = [
  { code: '5007', description: 'Woven fabrics of silk or silk waste' },
  { code: '5208', description: 'Woven fabrics of cotton (>85% cotton, <200g/m²)' },
  { code: '5407', description: 'Woven fabrics of synthetic filament yarn' },
  { code: '5801', description: 'Woven pile & chenille fabrics' },
  { code: '6103', description: 'Men\'s or boys\' suits, ensembles, jackets, trousers' },
  { code: '6106', description: 'Women\'s or girls\' blouses, shirts' },
  { code: '6214', description: 'Shawls, scarves, mufflers, mantillas, veils' }
];

// Common units in textile
const units = ['Piece', 'Meter', 'Kg', 'Yard', 'Set', 'Dozen'];

export default function InvoiceGenerator() {
  // State for invoice details
  const [invoiceNumber, setInvoiceNumber] = useState('INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('template-1');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [transportCharges, setTransportCharges] = useState(0);
  const [packagingCharges, setPackagingCharges] = useState(0);
  const [notes, setNotes] = useState('');
  const [ewaybillNumber, setEwaybillNumber] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');

  // Derived state
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId) || availableTemplates[0];

  // Helper function to add new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'Piece',
      price: 0,
      hsn: '',
      gstRate: 5,
      discount: 0
    };
    setItems([...items, newItem]);
  };

  // Helper function to update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Helper function to remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    const discountAmount = (itemTotal * item.discount) / 100;
    return sum + (itemTotal - discountAmount);
  }, 0);

  // Calculate GST amounts
  const calculateGST = () => {
    const gstSummary: Record<string, { taxable: number, amount: number }> = {};
    
    items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      const discountAmount = (itemTotal * item.discount) / 100;
      const taxableValue = itemTotal - discountAmount;
      
      const gstRate = item.gstRate.toString();
      if (!gstSummary[gstRate]) {
        gstSummary[gstRate] = { taxable: 0, amount: 0 };
      }
      
      gstSummary[gstRate].taxable += taxableValue;
      gstSummary[gstRate].amount += (taxableValue * item.gstRate) / 100;
    });
    
    return gstSummary;
  };
  
  const gstSummary = calculateGST();
  const totalGST = Object.values(gstSummary).reduce((sum, { amount }) => sum + amount, 0);
  
  // Calculate grand total
  const grandTotal = subtotal + totalGST + transportCharges + packagingCharges;

  const handleSaveInvoice = () => {
    // In a real app, this would save to a database
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoice Generator</h2>
          <p className="text-muted-foreground">
            Create professional invoices for your textile products
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            variant={activeTab === 'details' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('details')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
          <Button 
            variant={activeTab === 'preview' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('preview')}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6">
          {/* Invoice Header Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Hash className="h-5 w-5 mr-2 text-indigo-500" />
              Invoice Information
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="invoice-number">
                  Invoice Number
                </label>
                <input
                  id="invoice-number"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="invoice-date">
                  Invoice Date
                </label>
                <input
                  id="invoice-date"
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="due-date">
                  Due Date
                </label>
                <input
                  id="due-date"
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="ewaybill-number">
                  E-Way Bill Number (Optional)
                </label>
                <input
                  id="ewaybill-number"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={ewaybillNumber}
                  onChange={(e) => setEwaybillNumber(e.target.value)}
                  placeholder="E-Way Bill Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="place-of-supply">
                  Place of Supply
                </label>
                <input
                  id="place-of-supply"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder="Place of Supply"
                />
              </div>
            </div>
          </Card>

          {/* Customer Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-500" />
              Customer Details
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="customer-select">
                Select Customer
              </label>
              <select
                id="customer-select"
                className="w-full p-2 border rounded-md"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Select a customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h4 className="font-medium mb-2">{selectedCustomer.name}</h4>
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div>
                    <p className="text-gray-500">Address:</p>
                    <p>{selectedCustomer.address}</p>
                    <p>{selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}</p>
                  </div>
                  <div>
                    <p><span className="text-gray-500">GSTIN:</span> {selectedCustomer.gstin || 'Not Available'}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedCustomer.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Invoice Items */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-500" />
              Invoice Items
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center">HSN/SAC</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-center">Unit</th>
                    <th className="p-2 text-right">Price (₹)</th>
                    <th className="p-2 text-center">GST %</th>
                    <th className="p-2 text-center">Disc %</th>
                    <th className="p-2 text-right">Total (₹)</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-500">
                        No items added. Click "Add Item" below to start.
                      </td>
                    </tr>
                  ) : (
                    items.map(item => {
                      const itemTotal = item.quantity * item.price;
                      const discountAmount = (itemTotal * item.discount) / 100;
                      const afterDiscount = itemTotal - discountAmount;
                      
                      return (
                        <tr key={item.id} className="border-b dark:border-gray-700">
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full p-1 border rounded"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              className="w-full p-1 border rounded"
                              value={item.hsn}
                              onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                              aria-label="Select HSN code"
                            >
                              <option value="">Select HSN</option>
                              {hsnCodes.map(hsn => (
                                <option key={hsn.code} value={hsn.code}>
                                  {hsn.code} - {hsn.description.substring(0, 15)}...
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="w-full p-1 border rounded text-center"
                              value={item.quantity}
                              min="1"
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              aria-label={`Quantity for ${item.description || 'item'}`}
                            />
                          </td>
                          <td className="p-2">
                            <select
                              className="w-full p-1 border rounded"
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                              aria-label="Select unit of measurement"
                            >
                              {units.map(unit => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="w-full p-1 border rounded text-right"
                              value={item.price}
                              min="0"
                              step="0.01"
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              aria-label={`Price for ${item.description || 'item'}`}
                            />
                          </td>
                          <td className="p-2">
                            <select
                              className="w-full p-1 border rounded text-center"
                              value={item.gstRate}
                              onChange={(e) => updateItem(item.id, 'gstRate', parseInt(e.target.value))}
                              aria-label="Select GST rate"
                            >
                              {gstRates.map(rate => (
                                <option key={rate} value={rate}>
                                  {rate}%
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="w-full p-1 border rounded text-center"
                              value={item.discount}
                              min="0"
                              max="100"
                              onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                              aria-label={`Discount percentage for ${item.description || 'item'}`}
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            {formatCurrency(afterDiscount)}
                          </td>
                          <td className="p-2">
                            <button
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <Button variant="outline" size="sm" onClick={addItem} className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Card>

          {/* Additional Charges & Notes */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-indigo-500" />
                Additional Charges
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="transport-charges">
                    Transport Charges (₹)
                  </label>
                  <input
                    id="transport-charges"
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={transportCharges}
                    min="0"
                    onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="packaging-charges">
                    Packaging Charges (₹)
                  </label>
                  <input
                    id="packaging-charges"
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={packagingCharges}
                    min="0"
                    onChange={(e) => setPackagingCharges(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-indigo-500" />
                Notes & Terms
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="notes">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded-md h-24"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or special instructions"
                ></textarea>
              </div>
            </Card>
          </div>

          {/* Template Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-indigo-500" />
              Invoice Template
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {availableTemplates.map(template => (
                <div 
                  key={template.id}
                  className={`border rounded-md p-4 cursor-pointer ${
                    selectedTemplateId === template.id 
                      ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <div 
                      className="w-5 h-5 rounded-full ml-2"
                      style={{ backgroundColor: template.primaryColor }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">{template.footerText}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        // Preview Mode
        <Card className="p-6">
          <div className="mb-6 border-b pb-6" style={{ borderColor: selectedTemplate.secondaryColor }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: selectedTemplate.primaryColor }}>INVOICE</h1>
                <p className="text-gray-500">#{invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">WeaveMitra Textiles</p>
                <p>123 Handloom Street, Textile Hub</p>
                <p>Hyderabad, Telangana - 500001</p>
                <p>GSTIN: 36AABCT1234Z1ZP</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">BILL TO</h2>
              {selectedCustomer ? (
                <div>
                  <p className="font-bold">{selectedCustomer.name}</p>
                  <p>{selectedCustomer.address}</p>
                  <p>{selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}</p>
                  <p>GSTIN: {selectedCustomer.gstin || 'Not Available'}</p>
                </div>
              ) : (
                <p className="text-red-500">No customer selected</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="font-medium text-gray-500">Invoice Date:</p>
                <p>{new Date(invoiceDate).toLocaleDateString()}</p>
                
                <p className="font-medium text-gray-500">Due Date:</p>
                <p>{new Date(dueDate).toLocaleDateString()}</p>
                
                {ewaybillNumber && (
                  <>
                    <p className="font-medium text-gray-500">E-Way Bill Number:</p>
                    <p>{ewaybillNumber}</p>
                  </>
                )}
                
                {placeOfSupply && (
                  <>
                    <p className="font-medium text-gray-500">Place of Supply:</p>
                    <p>{placeOfSupply}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: selectedTemplate.secondaryColor }}>
                    <th className="py-2 text-left">Item & Description</th>
                    <th className="py-2 text-left">HSN/SAC</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Rate (₹)</th>
                    <th className="py-2 text-right">Discount</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">
                        No items added to this invoice.
                      </td>
                    </tr>
                  ) : (
                    items.map(item => {
                      const itemTotal = item.quantity * item.price;
                      const discountAmount = (itemTotal * item.discount) / 100;
                      const afterDiscount = itemTotal - discountAmount;
                      
                      return (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3">
                            <div className="font-medium">{item.description || 'Unnamed Item'}</div>
                          </td>
                          <td className="py-3">{item.hsn || 'N/A'}</td>
                          <td className="py-3 text-center">{item.quantity} {item.unit}</td>
                          <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                          <td className="py-3 text-right">
                            {item.discount > 0 ? `${item.discount}% (${formatCurrency(discountAmount)})` : '-'}
                          </td>
                          <td className="py-3 text-right font-medium">{formatCurrency(afterDiscount)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap mb-8">
            <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-4">
              <h3 className="font-medium mb-2">GST Summary</h3>
              <div className="border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="p-2 text-left">GST Rate</th>
                      <th className="p-2 text-right">Taxable Amount</th>
                      <th className="p-2 text-right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gstSummary).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-gray-500">
                          No GST data available
                        </td>
                      </tr>
                    ) : (
                      Object.entries(gstSummary).map(([rate, { taxable, amount }]) => (
                        <tr key={rate} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="p-2">{rate}%</td>
                          <td className="p-2 text-right">{formatCurrency(taxable)}</td>
                          <td className="p-2 text-right">{formatCurrency(amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {notes && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <div className="border rounded p-3 text-sm">
                    {notes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 md:pl-4">
              <div className="border rounded">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="p-2">Subtotal</td>
                      <td className="p-2 text-right">{formatCurrency(subtotal)}</td>
                    </tr>
                    {Object.entries(gstSummary).map(([rate, { amount }]) => (
                      <tr key={`gst-${rate}`} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="p-2">GST @ {rate}%</td>
                        <td className="p-2 text-right">{formatCurrency(amount)}</td>
                      </tr>
                    ))}
                    {transportCharges > 0 && (
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="p-2">Transport Charges</td>
                        <td className="p-2 text-right">{formatCurrency(transportCharges)}</td>
                      </tr>
                    )}
                    {packagingCharges > 0 && (
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="p-2">Packaging Charges</td>
                        <td className="p-2 text-right">{formatCurrency(packagingCharges)}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                      <td className="p-2">Total (INR)</td>
                      <td className="p-2 text-right">{formatCurrency(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border p-3 rounded" style={{ borderColor: selectedTemplate.secondaryColor }}>
                <h3 className="font-medium mb-2">Terms & Conditions</h3>
                <ul className="text-sm space-y-1">
                  {selectedTemplate.termsAndConditions.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t text-sm text-gray-500" style={{ borderColor: selectedTemplate.secondaryColor }}>
            {selectedTemplate.footerText}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        {activeTab === 'details' ? (
          <Button variant="outline" size="sm" onClick={() => setActiveTab('preview')} className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            Preview Invoice
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setActiveTab('details')} className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Edit Invoice
          </Button>
        )}
        
        <Button variant="outline" size="sm" className="flex items-center">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        
        <Button variant="outline" size="sm" className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        
        <Button variant="outline" size="sm" className="flex items-center">
          <Send className="h-4 w-4 mr-2" />
          Email Invoice
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center"
          onClick={handleSaveInvoice}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Invoice
        </Button>
      </div>

      {isSaved && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-3 rounded-md shadow-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Invoice saved successfully
        </div>
      )}
    </div>
  );
} 