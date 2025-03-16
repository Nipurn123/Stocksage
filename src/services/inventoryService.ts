import api from './api';
import { ApiResponse, InventoryLog, PaginatedResponse, PaginationParams, Product } from '@/types';

export const inventoryService = {
  // Get all products with pagination
  async getProducts(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return api.getPaginated<Product>('/inventory/products', params);
  },

  // Get single product by ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return api.get<Product>(`/inventory/products/${id}`);
  },

  // Create new product
  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return api.post<Product>('/inventory/products', data);
  },

  // Update product
  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return api.put<Product>(`/inventory/products/${id}`, data);
  },

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>(`/inventory/products/${id}`);
  },

  // Get inventory logs for a product
  async getInventoryLogs(productId: string, params: PaginationParams): Promise<ApiResponse<PaginatedResponse<InventoryLog>>> {
    return api.getPaginated<InventoryLog>(`/inventory/logs`, { 
      ...params, 
      search: productId  // Using search parameter to filter by productId
    });
  },

  // Add inventory (stock in)
  async addInventory(productId: string, quantity: number, notes?: string): Promise<ApiResponse<InventoryLog>> {
    return api.post<InventoryLog>('/inventory/add', {
      productId,
      quantity,
      notes,
    });
  },

  // Remove inventory (stock out)
  async removeInventory(productId: string, quantity: number, notes?: string): Promise<ApiResponse<InventoryLog>> {
    return api.post<InventoryLog>('/inventory/remove', {
      productId,
      quantity,
      notes,
    });
  },

  // Get low stock products
  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    return api.get<Product[]>('/inventory/low-stock');
  },

  // Get inventory value
  async getInventoryValue(): Promise<ApiResponse<{
    totalValue: number;
    totalProducts: number;
    averageValue: number;
    highestValueProduct: {
      product: Product;
      value: number;
    };
  }>> {
    return api.get<{
      totalValue: number;
      totalProducts: number;
      averageValue: number;
      highestValueProduct: {
        product: Product;
        value: number;
      };
    }>('/inventory/value');
  },

  // Import products from CSV
  async importProductsFromCsv(file: File): Promise<ApiResponse<{ importedCount: number; errors: string[] }>> {
    return api.uploadFile<{ importedCount: number; errors: string[] }>('/inventory/import', file);
  },

  // Export products to CSV
  async exportProductsToCsv(): Promise<ApiResponse<{ url: string }>> {
    return api.get<{ url: string }>('/inventory/export');
  },

  // Sync with Zoho Inventory
  async syncWithZoho(): Promise<ApiResponse<{ syncedProducts: number; errors: string[] }>> {
    return api.post<{ syncedProducts: number; errors: string[] }>('/inventory/sync/zoho');
  },
};

export default inventoryService; 