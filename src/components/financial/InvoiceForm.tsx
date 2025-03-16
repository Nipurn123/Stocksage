'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Plus, Trash2, CreditCard, ArrowUpDown, Save, Send } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  productSku?: string;
}

interface Customer {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

const InvoiceForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      productSku: '',
    },
  ]);
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [syncWithInventory, setSyncWithInventory] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  
  // For demo purposes, calculate tax at 10%
  const taxRate = 0.1;
  const taxAmount = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + taxAmount;

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: String(Date.now()),
        description: '',
        quantity: 1,
        unitPrice: 0,
        productSku: '',
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare data for API
      const invoiceData = {
        customer,
        items: items.map(({ id, ...rest }) => rest), // Remove the id as it's just for UI
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        syncWithInventory,
      };

      // Call API to create invoice
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      // Redirect to invoice details or success page
      router.push(`/financial/automated-invoicing?success=true&invoiceId=${data.invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Customer Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={customer.name}
              onChange={handleCustomerChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Enter customer name"
              title="Customer name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customer.email}
              onChange={handleCustomerChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Enter customer email"
              title="Customer email address"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customer.phone}
              onChange={handleCustomerChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={customer.address}
              onChange={handleCustomerChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU (Optional)
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      required
                      placeholder="Item description"
                      className="block w-full border-0 bg-transparent focus:ring-0 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      required
                      className="block w-20 border-0 bg-transparent focus:ring-0 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                        className="block w-24 border-0 bg-transparent focus:ring-0 dark:text-white"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={item.productSku || ''}
                      onChange={(e) => handleItemChange(item.id, 'productSku', e.target.value)}
                      placeholder="Product SKU"
                      className="block w-full border-0 bg-transparent focus:ring-0 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      disabled={items.length === 1}
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <Button
            type="button"
            onClick={addItem}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Summary</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
            <span className="font-medium text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Invoice Template
            </label>
            <select
              id="template"
              name="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              aria-label="Select invoice template"
              title="Select invoice template"
            >
              <option value="default">Default Template</option>
              <option value="modern">Modern Design</option>
              <option value="minimal">Minimal Style</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or payment instructions"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                id="syncInventory"
                name="syncInventory"
                type="checkbox"
                checked={syncWithInventory}
                onChange={(e) => setSyncWithInventory(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-700"
                aria-label="Sync with inventory"
                title="Sync with inventory"
              />
              <label htmlFor="syncInventory" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Sync with inventory (updates stock levels in Zoho Inventory)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/financial/automated-invoicing')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create & Send Invoice'}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm; 