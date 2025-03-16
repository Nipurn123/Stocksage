import api from './api';
import { ApiResponse, ExtractedInvoiceData, Invoice, PaginatedResponse, PaginationParams } from '@/types';

export const invoiceService = {
  // Get all invoices with pagination
  async getInvoices(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Invoice>>> {
    return api.getPaginated<Invoice>('/invoices', params);
  },

  // Get single invoice by ID
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return api.get<Invoice>(`/invoices/${id}`);
  },

  // Create new invoice
  async createInvoice(data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return api.post<Invoice>('/invoices', data);
  },

  // Update invoice
  async updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return api.put<Invoice>(`/invoices/${id}`, data);
  },

  // Delete invoice
  async deleteInvoice(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>(`/invoices/${id}`);
  },

  // Generate invoice PDF
  async generateInvoicePdf(id: string): Promise<ApiResponse<{ url: string }>> {
    return api.get<{ url: string }>(`/invoices/${id}/pdf`);
  },

  // Send invoice via email
  async sendInvoice(id: string, email: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>(`/invoices/${id}/send`, { email });
  },

  // Mark invoice as paid
  async markAsPaid(id: string): Promise<ApiResponse<Invoice>> {
    return api.put<Invoice>(`/invoices/${id}/status`, { status: 'paid' });
  },

  // Extract data from invoice image
  async extractInvoiceData(file: File): Promise<ApiResponse<ExtractedInvoiceData>> {
    return api.uploadFile<ExtractedInvoiceData>('/invoices/extract', file);
  },

  // Get invoice statistics
  async getInvoiceStats(): Promise<ApiResponse<{ 
    totalCount: number;
    paidCount: number;
    overdueCount: number;
    draftCount: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
  }>> {
    return api.get<{
      totalCount: number;
      paidCount: number;
      overdueCount: number;
      draftCount: number;
      totalAmount: number;
      paidAmount: number;
      overdueAmount: number;
    }>('/invoices/stats');
  },

  // Create invoice with Stripe
  async createStripeInvoice(id: string): Promise<ApiResponse<{ stripeInvoiceId: string; paymentLink: string }>> {
    return api.post<{ stripeInvoiceId: string; paymentLink: string }>(`/invoices/${id}/stripe`);
  },
};

export default invoiceService; 