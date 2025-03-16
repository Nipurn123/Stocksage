// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost?: number;
  currentStock: number;
  minStockLevel?: number;
  category?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  stripeInvoiceId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
  createdAt: string;
}

// Inventory Types
export interface InventoryLog {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  quantityChange: number;
  type: 'in' | 'out';
  reference: string;
  invoiceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Financial Types
export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  category: string;
  invoiceId?: string;
  userId: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentInvoices: Invoice[];
  topSellingProducts: {
    product: Product;
    soldQuantity: number;
  }[];
  salesOverTime: {
    date: string;
    amount: number;
  }[];
  recentActivities: {
    id: string;
    type: 'order' | 'inventory' | 'alert' | 'invoice';
    description: string;
    timestamp: string;
  }[];
  salesSummary: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  activeOrders?: number;
  pendingPayments?: number;
  overduePayments?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  fullName: string;
  businessName: string;
}

// Invoice Extraction Types
export interface ExtractedInvoiceData {
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  confidence: number;
}

// Settings Types
export interface UserSettings {
  userId: string;
  businessName: string;
  email: string;
  notificationsEnabled: boolean;
  lowStockThreshold: number;
  defaultDueDays: number;
  theme: 'light' | 'dark' | 'system';
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
} 