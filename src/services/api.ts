import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types';

// Use a conditional API URL that doesn't attempt to connect to a real backend in development
const isDevelopment = process.env.NODE_ENV === 'development';
// In development, use the same server URL to avoid CORS issues
const API_URL = isDevelopment ? 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') : 
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

// Function to check if current session is guest mode
const isGuestMode = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    return session?.user?.role === 'guest';
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

// Flag to check if we're in dev mode and should use mock data
const shouldUseMockData = async (): Promise<boolean> => {
  // Always use mock data in development
  if (isDevelopment) return true;
  // Or if it's a guest session
  return await isGuestMode();
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.user?.id) {
        // Using user ID as basic authorization since we no longer have tokens
        config.headers['Authorization'] = `Bearer ${session.user.id}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Just sign out on auth errors
        await signOut({ redirect: true, callbackUrl: '/auth/login' });
      } catch (refreshError) {
        await signOut({ redirect: true, callbackUrl: '/auth/login' });
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Mock data for guest mode
const mockData = {
  // User data
  user: {
    id: 'guest-user-id',
    fullName: 'Guest User',
    email: 'guest@stocksage.com',
    role: 'guest',
  },
  
  // Products data
  products: {
    data: Array(20).fill(null).map((_, i) => ({
      id: `product-${i + 1}`,
      name: `Demo Product ${i + 1}`,
      sku: `SKU-${1000 + i}`,
      category: i % 3 === 0 ? 'Electronics' : i % 3 === 1 ? 'Office Supplies' : 'Furniture',
      price: Math.floor(Math.random() * 1000) + 50,
      quantity: Math.floor(Math.random() * 100),
      reorderLevel: 10,
      createdAt: new Date().toISOString(),
    })),
    total: 42,
    page: 1,
    limit: 20,
    totalPages: 3,
  },
  
  // Sales data
  sales: {
    data: Array(10).fill(null).map((_, i) => ({
      id: `invoice-${i + 1}`,
      invoiceNumber: `INV-${2023000 + i}`,
      customerName: `Demo Customer ${i + 1}`,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      total: Math.floor(Math.random() * 10000) + 500,
      status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'pending' : 'overdue',
    })),
    total: 25,
    page: 1,
    limit: 10,
    totalPages: 3,
  },
};

export const api = {
  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check if we should use mock data
      const useMockData = await shouldUseMockData();
      
      // Handle mock data mode
      if (useMockData) {
        console.log('Using mock data for', config.url);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return appropriate mock data based on URL
        const url = config.url?.toLowerCase() || '';
        
        if (url.includes('/users/me')) {
          return { success: true, data: mockData.user as unknown as T };
        }
        
        if (url.includes('/products')) {
          if (url.includes('/products/') && config.method === 'GET') {
            // Single product
            const productId = url.split('/').pop();
            const product = mockData.products.data.find(p => p.id === productId);
            return { success: true, data: product as unknown as T };
          }
          return { success: true, data: mockData.products as unknown as T };
        }
        
        if (url.includes('/sales') || url.includes('/invoices')) {
          if ((url.includes('/sales/') || url.includes('/invoices/')) && config.method === 'GET') {
            // Single sale
            const saleId = url.split('/').pop();
            const sale = mockData.sales.data.find(s => s.id === saleId);
            return { success: true, data: sale as unknown as T };
          }
          return { success: true, data: mockData.sales as unknown as T };
        }
        
        // For auth endpoints
        if (url.includes('/auth/login')) {
          // Simulate successful login
          return { 
            success: true, 
            data: {
              user: mockData.user
            } as unknown as T
          };
        }
        
        // Generic success response for other endpoints
        return { success: true, data: {} as T };
      }
      
      // Normal API request flow for non-guest users
      try {
        const response: AxiosResponse<ApiResponse<T>> = await axiosInstance(config);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            success: false,
            error: error.response.data.error || 'An error occurred',
            message: error.response.data.message || 'Please try again later',
          };
        }
        
        // Fall back to mock data if network error in development
        if (isDevelopment) {
          console.warn('Network error in development - falling back to mock data');
          // Try again with mock data
          return this.request<T>(config);
        }
        
        return {
          success: false,
          error: 'Network error',
          message: 'Please check your internet connection',
        };
      }
    } catch (error) {
      console.error('Error in API request:', error);
      return {
        success: false,
        error: 'Application error',
        message: 'An unexpected error occurred',
      };
    }
  },

  // GET request
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  },

  // POST request
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  },

  // PUT request
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  },

  // DELETE request
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
  },

  // Paginated GET request
  async getPaginated<T>(
    url: string,
    params: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return this.get<PaginatedResponse<T>>(url, params);
  },

  // Upload files
  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }
    
    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api; 