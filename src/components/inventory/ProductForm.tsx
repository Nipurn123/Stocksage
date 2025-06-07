import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { Product } from '@/types';
import BarcodeGenerator from './BarcodeGenerator';

// Define form schema using zod
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  cost: z.coerce.number().min(0, 'Cost must be a positive number').optional(),
  currentStock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
  minStockLevel: z.coerce.number().int().min(0, 'Minimum stock level must be a non-negative integer').optional(),
  category: z.string().optional(),
  barcode: z.string().optional(),
  qrCodeData: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Partial<Product>;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
}

// Common categories for dropdown
const CATEGORIES = [
  'Electronics',
  'Office Supplies',
  'Furniture',
  'Kitchen',
  'Clothing',
  'Uncategorized'
];

export default function ProductForm({ product, onSubmit, isSubmitting }: ProductFormProps) {
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState<string | undefined>(product?.barcode);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch,
    setValue
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      price: product?.price || 0,
      cost: product?.cost || 0,
      currentStock: product?.currentStock || 0,
      minStockLevel: product?.minStockLevel || 5,
      category: product?.category || 'Uncategorized',
      barcode: product?.barcode || '',
      qrCodeData: product?.qrCodeData || '',
    }
  });

  // Watch the barcode field to update the preview
  const watchedBarcode = watch("barcode");
  
  // Generate a barcode based on SKU if barcode field is empty
  const generateBarcodeFromSku = () => {
    const sku = watch("sku");
    if (sku) {
      const timestamp = Date.now().toString().slice(-6);
      const newBarcode = `SKU${sku}${timestamp}`;
      setValue('barcode', newBarcode);
      setCurrentBarcode(newBarcode);
      setShowBarcodePreview(true);
    }
  };

  const onFormSubmit = (data: ProductFormData) => {
    // If product has a barcode, always include it in QR code data
    if (data.barcode && !data.qrCodeData) {
      // Create basic QR code data with product info
      const qrData = JSON.stringify({
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        price: data.price
      });
      data.qrCodeData = qrData;
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter product name"
          error={errors.name?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            {...register('sku')}
            placeholder="Enter unique SKU"
            error={errors.sku?.message}
          />
        </div>
        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <div className="flex">
            <Input
              id="barcode"
              {...register('barcode')}
              placeholder="Enter barcode or generate"
              error={errors.barcode?.message}
              className="rounded-r-none"
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentBarcode(e.target.value);
                  setShowBarcodePreview(true);
                } else {
                  setShowBarcodePreview(false);
                }
              }}
            />
            <Button
              type="button"
              onClick={generateBarcodeFromSku}
              className="rounded-l-none"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Barcode Preview */}
      {(showBarcodePreview || watchedBarcode) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Barcode Preview</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 p-4 bg-white rounded-lg">
              <BarcodeGenerator
                value={watchedBarcode || currentBarcode || ''}
                type="barcode"
                displayValue={true}
              />
            </div>
            <div className="w-full sm:w-1/2 p-4 bg-white rounded-lg">
              <BarcodeGenerator
                value={watchedBarcode || currentBarcode || ''}
                type="qrcode"
                productInfo={{
                  name: watch("name") || 'Product',
                  sku: watch("sku") || '',
                  price: watch("price") || 0,
                  description: watch("description")
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter product description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price')}
            placeholder="0.00"
            error={errors.price?.message}
          />
        </div>
        <div>
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            {...register('cost')}
            placeholder="0.00"
            error={errors.cost?.message}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:text-white"
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentStock">Current Stock *</Label>
          <Input
            id="currentStock"
            type="number"
            min="0"
            step="1"
            {...register('currentStock')}
            placeholder="0"
            error={errors.currentStock?.message}
          />
        </div>
        <div>
          <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
          <Input
            id="minStockLevel"
            type="number"
            min="0"
            step="1"
            {...register('minStockLevel')}
            placeholder="5"
            error={errors.minStockLevel?.message}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" onClick={() => reset()} variant="outline">
          Reset
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
} 