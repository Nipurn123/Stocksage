import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { Product } from '@/types';

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
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
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
    },
  });

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input 
            id="name"
            placeholder="Enter product name" 
            {...register('name')} 
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input 
            id="sku"
            placeholder="Enter SKU" 
            {...register('sku')} 
          />
          {errors.sku && (
            <p className="text-sm text-red-500">{errors.sku.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black dark:border-gray-700 dark:text-white"
            {...register('category')}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        {/* Current Stock */}
        <div className="space-y-2">
          <Label htmlFor="currentStock">Current Stock</Label>
          <Input 
            id="currentStock"
            type="number" 
            min="0" 
            step="1" 
            {...register('currentStock')} 
          />
          {errors.currentStock && (
            <p className="text-sm text-red-500">{errors.currentStock.message}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input 
            id="price"
            type="number" 
            min="0" 
            step="0.01" 
            {...register('price')} 
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        {/* Cost */}
        <div className="space-y-2">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input 
            id="cost"
            type="number" 
            min="0" 
            step="0.01" 
            {...register('cost')} 
          />
          {errors.cost && (
            <p className="text-sm text-red-500">{errors.cost.message}</p>
          )}
        </div>

        {/* Minimum Stock Level */}
        <div className="space-y-2">
          <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
          <Input 
            id="minStockLevel"
            type="number" 
            min="0" 
            step="1" 
            {...register('minStockLevel')} 
          />
          {errors.minStockLevel && (
            <p className="text-sm text-red-500">{errors.minStockLevel.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          placeholder="Enter product description" 
          className="min-h-[100px]" 
          {...register('description')} 
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : product?.id ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
} 