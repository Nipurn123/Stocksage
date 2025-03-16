import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Registration form validation schema
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Product form validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce
    .number()
    .min(0, 'Price must be greater than or equal to 0')
    .transform((val) => parseFloat(val.toFixed(2))),
  cost: z.coerce
    .number()
    .min(0, 'Cost must be greater than or equal to 0')
    .transform((val) => parseFloat(val.toFixed(2))),
  currentStock: z.coerce.number().int('Stock must be a whole number').min(0, 'Stock must be greater than or equal to 0'),
  reorderLevel: z.coerce.number().int('Reorder level must be a whole number').min(0, 'Reorder level must be greater than or equal to 0'),
  category: z.string().min(1, 'Category is required'),
});

// Invoice form validation schema
export const invoiceSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product is required'),
      quantity: z.coerce.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
      unitPrice: z.coerce
        .number()
        .min(0, 'Unit price must be greater than or equal to 0')
        .transform((val) => parseFloat(val.toFixed(2))),
    })
  ).min(1, 'At least one item is required'),
});

// Financial record form validation schema
export const financialRecordSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Please select a valid type' }),
  }),
  amount: z.coerce
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .transform((val) => parseFloat(val.toFixed(2))),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Password reset schema
export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Settings form validation schema
export const settingsSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  notificationsEnabled: z.boolean(),
  lowStockThreshold: z.coerce.number().int('Threshold must be a whole number').min(0, 'Threshold must be greater than or equal to 0'),
  defaultDueDays: z.coerce.number().int('Days must be a whole number').min(1, 'Days must be at least 1'),
  theme: z.enum(['light', 'dark', 'system'], {
    errorMap: () => ({ message: 'Please select a valid theme' }),
  }),
}); 