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

// Customer Types
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  userId: string;
  totalSpent: number;
  lastPurchaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: {
    customer: Customer;
    totalSpent: number;
    orderCount: number;
  }[];
  recentCustomers: Customer[];
  customersByMonth: {
    month: string;
    count: number;
  }[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  qrCodeData?: string;
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

// Report Types
export interface ReportData {
  id: string;
  name: string;
  description?: string;
  type: 'sales' | 'inventory' | 'financial' | 'customers' | 'custom';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  format: 'pdf' | 'csv' | 'excel';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  parameters?: Record<string, any>;
  fileUrl?: string;
}

export interface ReportStats {
  recentReports: ReportData[];
  availableReportTypes: {
    type: string;
    name: string;
    description: string;
  }[];
  totalReportsGenerated: number;
  popularReports: {
    type: string;
    count: number;
  }[];
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