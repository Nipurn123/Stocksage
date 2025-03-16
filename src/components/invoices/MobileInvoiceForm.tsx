'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Trash2, Plus, Save, Send, Download, CreditCard } from 'lucide-react';
import invoiceService from '@/services/invoiceService';
import { stripeService } from '@/lib/stripe';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Invoice, InvoiceItem } from '@/types';

// Define the schema for the form
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Minimum quantity is 1'),
  rate: z.number().min(0.01, 'Rate must be greater than 0'),
  tax: z.number().min(0),
});

const invoiceFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1, 'Customer address is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  taxRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%'),
  complianceDetails: z.object({
    taxId: z.string().optional(),
    vatNumber: z.string().optional(),
    regulatoryInfo: z.string().optional(),
  }),
  sendToCustomer: z.boolean().optional(),
  processPayment: z.boolean().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const defaultValues: InvoiceFormValues = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  items: [
    {
      description: '',
      quantity: 1,
      rate: 0,
      tax: 0,
    },
  ],
  notes: 'Thank you for your business!',
  terms: 'Payment due within 30 days.',
  taxRate: 7,
  complianceDetails: {
    taxId: '',
    vatNumber: '',
    regulatoryInfo: '',
  },
  sendToCustomer: true,
  processPayment: false,
};

const paymentTermsOptions = [
  { value: 'net15', label: 'Net 15 days' },
  { value: 'net30', label: 'Net 30 days' },
  { value: 'net45', label: 'Net 45 days' },
  { value: 'net60', label: 'Net 60 days' },
  { value: 'due-receipt', label: 'Due on receipt' },
  { value: 'due-end-month', label: 'Due end of month' },
  { value: 'due-15', label: 'Due 15th of month' },
];

const taxRateOptions = [
  { value: '0', label: 'No Tax (0%)' },
  { value: '5', label: 'GST/HST (5%)' },
  { value: '7', label: 'Standard Rate (7%)' },
  { value: '10', label: 'VAT (10%)' },
  { value: '13', label: 'HST (13%)' },
  { value: '15', label: 'VAT (15%)' },
  { value: '20', label: 'VAT (20%)' },
  { value: '21', label: 'VAT (21%)' },
];

// Define a local Customer interface
interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const MobileInvoiceForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [accordionState, setAccordionState] = useState({
    customerDetails: true,
    invoiceDetails: false,
    lineItems: false,
    complianceDetails: false,
    paymentOptions: false,
  });
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchTaxRate = watch('taxRate');

  // Calculate subtotal, tax, and total
  const calculateSubtotal = () => {
    return watchItems?.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0) || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (watchTaxRate / 100));
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Process customer first
      const { stripeCustomerId, dbCustomerId } = await stripeService.getOrCreateCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone || '',
        address: data.customerAddress,
      });

      // Format the invoice data
      const invoiceData: Partial<Invoice> = {
        invoiceNumber: data.invoiceNumber,
        date: data.invoiceDate,
        dueDate: data.dueDate,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        totalAmount: calculateTotal(),
        status: 'draft',
        stripeInvoiceId: stripeCustomerId,
        // These fields will be filled by the backend
        // id, userId, createdAt, updatedAt, items
      };

      // Create the invoice
      const response = await invoiceService.createInvoice(invoiceData);
      
      toast.success('Invoice created successfully!');
      
      // Redirect based on the send and payment options
      if (data.processPayment && response.data?.id) {
        router.push(`/financial/automated-invoicing/payment/${response.data.id}`);
      } else if (data.sendToCustomer && response.data?.id) {
        router.push(`/financial/automated-invoicing/sent/${response.data.id}`);
      } else if (response.data?.id) {
        router.push(`/financial/automated-invoicing/${response.data.id}`);
      } else {
        router.push('/financial/automated-invoicing');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle accordion sections
  const toggleAccordion = (section: keyof typeof accordionState) => {
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Summary bar that sticks to the top on mobile */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black p-4 -mx-4 mb-4 shadow-md border-b border-gray-200 dark:border-gray-800 sm:rounded-lg sm:mx-0 sm:shadow-none sm:border sm:static">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Invoice</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total: {formatCurrency(calculateTotal())}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-1" />}
              Save Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <Card className="overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-900"
          onClick={() => toggleAccordion('customerDetails')}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Customer Details
          </h3>
          <span className="text-blue-600 dark:text-blue-400">
            {accordionState.customerDetails ? '▲' : '▼'}
          </span>
        </div>
        
        {accordionState.customerDetails && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Name *
                </label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                  error={errors.customerName?.message}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Email *
                </label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register('customerEmail')}
                  error={errors.customerEmail?.message}
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Phone
                </label>
                <Input
                  id="customerPhone"
                  {...register('customerPhone')}
                  error={errors.customerPhone?.message}
                  placeholder="(123) 456-7890"
                />
              </div>
              
              <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Address *
                </label>
                <Input
                  id="customerAddress"
                  {...register('customerAddress')}
                  error={errors.customerAddress?.message}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Invoice Details Section */}
      <Card className="overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-900"
          onClick={() => toggleAccordion('invoiceDetails')}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Invoice Details
          </h3>
          <span className="text-blue-600 dark:text-blue-400">
            {accordionState.invoiceDetails ? '▲' : '▼'}
          </span>
        </div>
        
        {accordionState.invoiceDetails && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice Number *
                </label>
                <Input
                  id="invoiceNumber"
                  {...register('invoiceNumber')}
                  error={errors.invoiceNumber?.message}
                />
              </div>
              
              <div>
                <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice Date *
                </label>
                <Input
                  id="invoiceDate"
                  type="date"
                  {...register('invoiceDate')}
                  error={errors.invoiceDate?.message}
                />
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date *
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  error={errors.dueDate?.message}
                />
              </div>
              
              <div className="md:col-span-3">
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Terms
                </label>
                <Select
                  id="terms"
                  options={paymentTermsOptions}
                  onChange={(e) => {
                    const value = e.target.value;
                    const today = new Date();
                    let dueDate = new Date();
                    
                    switch(value) {
                      case 'net15':
                        dueDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                        break;
                      case 'net30':
                        dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                        break;
                      case 'net45':
                        dueDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
                        break;
                      case 'net60':
                        dueDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
                        break;
                      case 'due-receipt':
                        dueDate = today;
                        break;
                      case 'due-end-month':
                        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        break;
                      case 'due-15':
                        dueDate = new Date(today.getFullYear(), today.getMonth(), 15);
                        if (today.getDate() > 15) {
                          dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 15);
                        }
                        break;
                    }
                    
                    setValue('dueDate', dueDate.toISOString().split('T')[0]);
                    
                    // Update terms text
                    const termText = paymentTermsOptions.find(option => option.value === value)?.label || '';
                    setValue('terms', `Payment due within ${termText}.`);
                  }}
                />
              </div>
              
              <div className="md:col-span-3">
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Rate
                </label>
                <Controller
                  name="taxRate"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="taxRate"
                      options={taxRateOptions}
                      value={field.value.toString()}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Line Items Section */}
      <Card className="overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-900"
          onClick={() => toggleAccordion('lineItems')}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Line Items
          </h3>
          <span className="text-blue-600 dark:text-blue-400">
            {accordionState.lineItems ? '▲' : '▼'}
          </span>
        </div>
        
        {accordionState.lineItems && (
          <div className="p-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Item #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label htmlFor={`items.${index}.description`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description *
                      </label>
                      <Input
                        id={`items.${index}.description`}
                        {...register(`items.${index}.description`)}
                        error={errors.items?.[index]?.description?.message}
                        placeholder="Item description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor={`items.${index}.quantity`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Qty *
                        </label>
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              id={`items.${index}.quantity`}
                              type="number"
                              min="1"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              value={field.value}
                              error={errors.items?.[index]?.quantity?.message}
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`items.${index}.rate`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rate *
                        </label>
                        <Controller
                          name={`items.${index}.rate`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              id={`items.${index}.rate`}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              value={field.value}
                              error={errors.items?.[index]?.rate?.message}
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`items.${index}.tax`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tax
                        </label>
                        <Controller
                          name={`items.${index}.tax`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              id={`items.${index}.tax`}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              value={field.value}
                              error={errors.items?.[index]?.tax?.message}
                            />
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 text-right pt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total: {formatCurrency((watchItems[index]?.quantity || 0) * (watchItems[index]?.rate || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append({ description: '', quantity: 1, rate: 0, tax: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
              
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tax ({watchTaxRate}%):</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(calculateTax())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Total:</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                  placeholder="Additional notes for the customer"
                  {...register('notes')}
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Compliance Details Section */}
      <Card className="overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-900"
          onClick={() => toggleAccordion('complianceDetails')}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Compliance Details
          </h3>
          <span className="text-blue-600 dark:text-blue-400">
            {accordionState.complianceDetails ? '▲' : '▼'}
          </span>
        </div>
        
        {accordionState.complianceDetails && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="complianceDetails.taxId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax ID / EIN
                </label>
                <Input
                  id="complianceDetails.taxId"
                  {...register('complianceDetails.taxId')}
                  error={errors.complianceDetails?.taxId?.message}
                  placeholder="e.g., 12-3456789"
                />
              </div>
              
              <div>
                <label htmlFor="complianceDetails.vatNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VAT Number
                </label>
                <Input
                  id="complianceDetails.vatNumber"
                  {...register('complianceDetails.vatNumber')}
                  error={errors.complianceDetails?.vatNumber?.message}
                  placeholder="e.g., GB123456789"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="complianceDetails.regulatoryInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Regulatory Information
                </label>
                <textarea
                  id="complianceDetails.regulatoryInfo"
                  rows={2}
                  className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                  placeholder="Any additional regulatory information"
                  {...register('complianceDetails.regulatoryInfo')}
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Payment Options Section */}
      <Card className="overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-900"
          onClick={() => toggleAccordion('paymentOptions')}
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Payment & Delivery Options
          </h3>
          <span className="text-blue-600 dark:text-blue-400">
            {accordionState.paymentOptions ? '▲' : '▼'}
          </span>
        </div>
        
        {accordionState.paymentOptions && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendToCustomer"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('sendToCustomer')}
              />
              <label htmlFor="sendToCustomer" className="text-sm text-gray-700 dark:text-gray-300">
                Send invoice to customer via email
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="processPayment"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('processPayment')}
              />
              <label htmlFor="processPayment" className="text-sm text-gray-700 dark:text-gray-300">
                Create payment link with Stripe
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* Submit Buttons */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-1" />}
          Save Invoice
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setValue('sendToCustomer', true);
            handleSubmit(onSubmit)();
          }}
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 mr-1" />
          Save & Send
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setValue('processPayment', true);
            handleSubmit(onSubmit)();
          }}
          disabled={isSubmitting}
        >
          <CreditCard className="h-4 w-4 mr-1" />
          Save & Process Payment
        </Button>
      </div>
    </form>
  );
};

export default MobileInvoiceForm; 