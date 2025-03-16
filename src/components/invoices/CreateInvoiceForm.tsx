'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Label
} from '@/components/ui';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, MinusCircle, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Validation schema for the invoice form
const invoiceFormSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.coerce.number().positive('Quantity must be positive'),
      unitPrice: z.coerce.number().positive('Unit price must be positive'),
      productSku: z.string().optional(),
      amount: z.number().optional(),
    })
  ).min(1, 'At least one item is required'),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  customFields: z.record(z.string()).optional(),
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
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer: { name: '', email: '', address: '', phone: '' },
      items: [{ description: '', quantity: 1, unitPrice: 0, productSku: '' }],
      notes: '',
    },
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

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    
    // Calculate final amounts for all items
    data.items = data.items.map(item => ({
      ...item,
      amount: item.quantity * item.unitPrice
    }));
    
    // Add custom fields to the data
    const customFieldsObject: Record<string, string> = {};
    customFields.forEach(({ key, value }) => {
      customFieldsObject[key] = value;
    });
    data.customFields = customFieldsObject;

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      const result = await response.json();
      toast.success('Invoice created successfully!');
      
      // Redirect to the invoice page
      window.location.href = `/invoices/${result.invoiceId}`;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  className={errors.customer?.name ? 'border-red-500 focus:ring-red-500' : ''}
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
                  className={errors.customer?.email ? 'border-red-500 focus:ring-red-500' : ''}
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
                        className={errors.items?.[index]?.description ? 'border-red-500' : ''}
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
                        className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
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
                        className={errors.items?.[index]?.unitPrice ? 'border-red-500' : ''}
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
                        className="bg-gray-50 dark:bg-gray-800"
                        value={formatCurrency(watch(`items.${index}.amount`) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        placeholder="SKU (optional)"
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
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("dueDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("dueDate") ? format(watch("dueDate") as Date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch("dueDate") as Date || undefined}
                      onSelect={(date) => date && setValue("dueDate", date as Date)}
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
                  {...register("paymentTerms")}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes or payment instructions"
                  className="min-h-[100px]"
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
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
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
    </div>
  );
} 