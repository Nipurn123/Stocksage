import api from './api';
import { ApiResponse, FinancialRecord, PaginatedResponse, PaginationParams } from '@/types';

export const financialService = {
  // Get all financial records with pagination
  async getFinancialRecords(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<FinancialRecord>>> {
    return api.getPaginated<FinancialRecord>('/financial/records', params);
  },

  // Get single financial record by ID
  async getFinancialRecord(id: string): Promise<ApiResponse<FinancialRecord>> {
    return api.get<FinancialRecord>(`/financial/records/${id}`);
  },

  // Create new financial record
  async createFinancialRecord(data: Partial<FinancialRecord>): Promise<ApiResponse<FinancialRecord>> {
    return api.post<FinancialRecord>('/financial/records', data);
  },

  // Update financial record
  async updateFinancialRecord(id: string, data: Partial<FinancialRecord>): Promise<ApiResponse<FinancialRecord>> {
    return api.put<FinancialRecord>(`/financial/records/${id}`, data);
  },

  // Delete financial record
  async deleteFinancialRecord(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>(`/financial/records/${id}`);
  },

  // Get financial summary
  async getFinancialSummary(startDate: string, endDate: string): Promise<ApiResponse<{
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    incomeByCategory: Record<string, number>;
    expensesByCategory: Record<string, number>;
    monthlyData: {
      month: string;
      income: number;
      expenses: number;
      net: number;
    }[];
  }>> {
    return api.get<{
      totalIncome: number;
      totalExpenses: number;
      netIncome: number;
      incomeByCategory: Record<string, number>;
      expensesByCategory: Record<string, number>;
      monthlyData: {
        month: string;
        income: number;
        expenses: number;
        net: number;
      }[];
    }>('/financial/summary', { startDate, endDate });
  },

  // Generate financial report
  async generateFinancialReport(startDate: string, endDate: string, reportType: 'income' | 'expense' | 'full'): Promise<ApiResponse<{ url: string }>> {
    return api.get<{ url: string }>('/financial/report', { startDate, endDate, reportType });
  },

  // Import financial records from CSV
  async importFinancialRecordsFromCsv(file: File): Promise<ApiResponse<{ importedCount: number; errors: string[] }>> {
    return api.uploadFile<{ importedCount: number; errors: string[] }>('/financial/import', file);
  },

  // Export financial records to CSV
  async exportFinancialRecordsToCsv(startDate: string, endDate: string): Promise<ApiResponse<{ url: string }>> {
    return api.get<{ url: string }>('/financial/export', { startDate, endDate });
  },
};

export default financialService; 