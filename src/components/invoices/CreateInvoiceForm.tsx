'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Button, 
  Calendar, 
  Input, 
  Textarea, 
  Card, 
  Popover, 
  PopoverContent, 
  PopoverTrigger,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, MinusCircle, LoaderCircle, AlertTriangle, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProfessionalInvoiceTemplate from './ProfessionalInvoiceTemplate';

// Validation schema for the invoice form
const invoiceFormSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, 'Customer name is required'),
    email: z.string().trim().email('Invalid email address'),
    address: z.string().optional().nullable().transform(val => val || ''),
    phone: z.string().optional().nullable().transform(val => val || ''),
  }),
  items: z.array(
    z.object({
      description: z.string().trim().min(1, 'Description is required'),
      quantity: z.coerce
        .number()
        .positive('Quantity must be positive')
        .or(z.nan().transform(() => 1))
        .transform(val => isNaN(val) ? 1 : val),
      unitPrice: z.coerce
        .number()
        .min(0, 'Unit price must be greater than or equal to 0')
        .or(z.nan().transform(() => 0))
        .transform(val => isNaN(val) ? 0 : val),
      productSku: z.string().optional().nullable().transform(val => val || ''),
      amount: z.number().optional().default(0),
    })
  ).min(1, 'At least one item is required'),
  dueDate: z
    .date()
    .nullable()
    .optional()
    .transform(val => val || null),
  notes: z.string().optional().nullable().transform(val => val || ''),
  paymentTerms: z.string().optional().nullable().transform(val => val || ''),
  customFields: z.record(z.string()).optional().default({}),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// Add formatCurrency utility function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function CreateInvoiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('form');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    address: '123 Business St, City, ST 12345',
    email: 'contact@yourcompany.com',
    phone: '(123) 456-7890',
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer: { name: '', email: '', address: '', phone: '' },
      items: [{ description: '', quantity: 1, unitPrice: 0, productSku: '', amount: 0 }],
      notes: '',
      paymentTerms: '',
      dueDate: null,
      customFields: {},
    },
    mode: 'onSubmit',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const totalAmount = watchItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 
    0
  );

  const addItem = () => {
    append({ 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      productSku: '', 
      amount: 0 
    });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  // Clear form error when input changes
  useEffect(() => {
    if (formError) {
      const subscription = watch(() => {
        setFormError(null);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, formError]);

  // Function to handle form validation errors
  const handleFormErrors = (errors: FieldErrors<InvoiceFormValues>) => {
    console.error('Form validation errors:', errors);
    
    // Create user-friendly error message
    if (errors.customer?.name) {
      setFormError('Customer name is required');
    } else if (errors.customer?.email) {
      setFormError('Please enter a valid email address');
    } else if (errors.items) {
      if (Array.isArray(errors.items)) {
        // Find first item with an error
        const itemWithError = errors.items.findIndex(item => item?.description || item?.quantity || item?.unitPrice);
        if (itemWithError !== -1) {
          setFormError(`Please check item #${itemWithError + 1} - all required fields must be filled`);
        } else {
          setFormError('Please check invoice items - all required fields must be filled');
        }
      } else {
        setFormError('At least one invoice item is required');
      }
    } else {
      setFormError('Please check the form for errors');
    }
  };

  // Add a function to validate the form data
  const validateFormData = (data: InvoiceFormValues): boolean => {
    // Check for required customer fields
    if (!data.customer.name || !data.customer.name.trim()) {
      setFormError('Customer name is required');
      return false;
    }
    
    if (!data.customer.email || !data.customer.email.trim()) {
      setFormError('Customer email is required');
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customer.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    // Check for at least one item
    if (!data.items || data.items.length === 0) {
      setFormError('At least one invoice item is required');
      return false;
    }
    
    // Check each item has required fields
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.description || !item.description.trim()) {
        setFormError(`Item #${i + 1} requires a description`);
        return false;
      }
      
      if (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        setFormError(`Item #${i + 1} requires a positive quantity`);
        return false;
      }
      
      if (isNaN(Number(item.unitPrice)) || Number(item.unitPrice) < 0) {
        setFormError(`Item #${i + 1} requires a valid price`);
        return false;
      }
    }
    
    return true;
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    // First, validate the form data manually
    if (!validateFormData(data)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Deep clone the data to avoid modifying the original
      const processedData = JSON.parse(JSON.stringify(data));
      
      // Handle date data - ISO string for API
      if (processedData.dueDate) {
        // Keep dueDate as is - it should already be a Date object that will be serialized to ISO string
      } else {
        // Ensure null is passed and not undefined
        processedData.dueDate = null;
      }
      
      // Calculate final amounts for all items and ensure all fields are present
      processedData.items = processedData.items.map((item: any) => ({
        description: item.description || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        productSku: item.productSku || '',
        amount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
      }));
      
      // Ensure customer fields are present
      processedData.customer = {
        name: processedData.customer.name || '',
        email: processedData.customer.email || '',
        address: processedData.customer.address || '',
        phone: processedData.customer.phone || '',
      };
      
      // Process notes and payment terms
      processedData.notes = processedData.notes || '';
      processedData.paymentTerms = processedData.paymentTerms || '';
      
      // Add company information to the data
      processedData.company = {
        name: companyInfo.name,
        address: companyInfo.address,
        email: companyInfo.email,
        phone: companyInfo.phone,
      };
      
      // Add custom fields
      processedData.customFields = processedData.customFields || {};

      console.log('Submitting invoice:', processedData);

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // Handle case where the response isn't JSON
        throw new Error('Failed to parse server response');
      }
      
      if (!response.ok) {
        throw new Error(responseData?.message || 'Failed to create invoice');
      }

      toast.success('Invoice created successfully!');
      
      // Redirect to the invoice page after a short delay to show success message
      setTimeout(() => {
        window.location.href = `/invoices/${responseData?.invoiceId || responseData?.id || ''}`;
      }, 1000);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating the invoice');
      setFormError(error instanceof Error ? error.message : 'Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for the preview
  const formatDateString = (date: Date | null): string => {
    if (!date) return new Date().toISOString();
    return date.toISOString();
  };

  // Calculate subtotal from items
  const calculateSubtotal = (): number => {
    return watchItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 
      0
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="form" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Edit Form
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview Invoice
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'preview' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.print()}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Preview
            </Button>
          )}
        </div>

        <TabsContent value="form">
          <form onSubmit={handleSubmit(onSubmit, handleFormErrors)} className="space-y-8">
            {formError && (
              <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-400 mb-6">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            
            {/* Your Company Information */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
                  </svg>
                  Your Company Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Your company name"
                      className="text-gray-900 dark:text-gray-100"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">
                      Company Email
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="Your company email"
                      className="text-gray-900 dark:text-gray-100"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">
                      Company Phone
                    </Label>
                    <Input
                      id="companyPhone"
                      placeholder="Your company phone number"
                      className="text-gray-900 dark:text-gray-100"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">
                      Company Address
                    </Label>
                    <Input
                      id="companyAddress"
                      placeholder="Your company address"
                      className="text-gray-900 dark:text-gray-100"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Customer Information Section */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Customer Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className={errors.customer?.name ? 'text-red-500' : ''}>
                      Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      className={cn(
                        "text-gray-900 dark:text-gray-100",
                        errors.customer?.name ? 'border-red-500 focus:ring-red-500' : ''
                      )}
                      {...register("customer.name")}
                    />
                    {errors.customer?.name && (
                      <p className="text-red-500 text-sm">{errors.customer?.name?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className={errors.customer?.email ? 'text-red-500' : ''}>
                      Customer Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="Enter customer email"
                      className={cn(
                        "text-gray-900 dark:text-gray-100",
                        errors.customer?.email ? 'border-red-500 focus:ring-red-500' : ''
                      )}
                      {...register("customer.email")}
                    />
                    {errors.customer?.email && (
                      <p className="text-red-500 text-sm">{errors.customer?.email?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">
                      Customer Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      placeholder="Enter customer phone number"
                      className="text-gray-900 dark:text-gray-100"
                      {...register("customer.phone")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">
                      Customer Address
                    </Label>
                    <Input
                      id="customerAddress"
                      placeholder="Enter customer address"
                      className="text-gray-900 dark:text-gray-100"
                      {...register("customer.address")}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Invoice Items Section */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  Invoice Items
                </h3>
                <Button 
                  type="button" 
                  onClick={addItem}
                  variant="outline"
                  className="flex items-center text-sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description <span className="text-red-500">*</span></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Qty <span className="text-red-500">*</span></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Price <span className="text-red-500">*</span></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {fields.map((field, index) => (
                      <tr key={field.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                        <td className="px-6 py-4">
                          <Input
                            placeholder="Item description"
                            className={cn(
                              "text-gray-900 dark:text-gray-100",
                              errors.items?.[index]?.description ? 'border-red-500' : ''
                            )}
                            {...register(`items.${index}.description`)}
                          />
                          {errors.items?.[index]?.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.items?.[index]?.description?.message}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            className={cn(
                              "text-gray-900 dark:text-gray-100",
                              errors.items?.[index]?.quantity ? 'border-red-500' : ''
                            )}
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                // Calculate amount based on quantity and price
                                const quantity = parseFloat(e.target.value) || 0;
                                const unitPrice = watch(`items.${index}.unitPrice`) || 0;
                                const amount = quantity * unitPrice;
                                
                                // Use setValue instead of directly manipulating register
                                setValue(`items.${index}.amount`, amount);
                              },
                            })}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-red-500 text-xs mt-1">{errors.items?.[index]?.quantity?.message}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Price"
                            className={cn(
                              "text-gray-900 dark:text-gray-100",
                              errors.items?.[index]?.unitPrice ? 'border-red-500' : ''
                            )}
                            {...register(`items.${index}.unitPrice`, {
                              valueAsNumber: true,
                              onChange: (e) => {
                                // Calculate amount based on quantity and price
                                const unitPrice = parseFloat(e.target.value) || 0;
                                const quantity = watch(`items.${index}.quantity`) || 0;
                                const amount = quantity * unitPrice;
                                
                                // Use setValue instead of directly manipulating register
                                setValue(`items.${index}.amount`, amount);
                              },
                            })}
                          />
                          {errors.items?.[index]?.unitPrice && (
                            <p className="text-red-500 text-xs mt-1">{errors.items?.[index]?.unitPrice?.message}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            readOnly
                            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            value={formatCurrency(watch(`items.${index}.amount`) || 0)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            placeholder="SKU (optional)"
                            className="text-gray-900 dark:text-gray-100"
                            {...register(`items.${index}.productSku`)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeItem(index)}
                            >
                              <MinusCircle className="h-5 w-5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(
                          watchItems.reduce(
                            (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 
                            0
                          )
                        )}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* Invoice Details Section */}
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Invoice Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watch("dueDate") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watch("dueDate") ? format(new Date(watch("dueDate") as Date), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watch("dueDate") ? new Date(watch("dueDate") as Date) : undefined}
                          onSelect={(date) => {
                            if (date instanceof Date) {
                              setValue("dueDate", date);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      placeholder="e.g., Net 30, Due on Receipt"
                      className="text-gray-900 dark:text-gray-100"
                      {...register("paymentTerms")}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes or payment instructions"
                      className="min-h-[100px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      {...register("notes")}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isSubmitting || formIsSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || formIsSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting || formIsSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="preview" className="print:block">
          <ProfessionalInvoiceTemplate
            invoiceNumber={`INV-${new Date().getTime().toString().slice(-6)}`}
            date={formatDateString(new Date())}
            dueDate={watch("dueDate") ? formatDateString(watch("dueDate") as Date) : formatDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
            customerName={watch("customer.name") || "Customer Name"}
            customerEmail={watch("customer.email") || "customer@example.com"}
            customerAddress={watch("customer.address") || ""}
            customerPhone={watch("customer.phone") || ""}
            companyName={companyInfo.name}
            companyAddress={companyInfo.address}
            companyEmail={companyInfo.email}
            companyPhone={companyInfo.phone}
            items={watchItems.map(item => ({
              description: item.description || "Item description",
              quantity: Number(item.quantity) || 0,
              unitPrice: Number(item.unitPrice) || 0,
              amount: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
              productSku: item.productSku || ""
            }))}
            notes={watch("notes") || ""}
            paymentTerms={watch("paymentTerms") || "Net 30 days"}
            subtotal={calculateSubtotal()}
            totalAmount={calculateSubtotal()}
            status="draft"
            isPrintable={true}
          />
          
          <div className="mt-8 flex justify-between print:hidden">
            <Button
              variant="outline"
              onClick={() => setActiveTab('form')}
            >
              Back to Edit Form
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit, handleFormErrors)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || formIsSubmitting}
            >
              {isSubmitting || formIsSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Don't forget to add styles for printing
const PrinterIcon = ({ className = "h-4 w-4" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
    />
  </svg>
); 