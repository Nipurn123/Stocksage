import api from './api';
import { ApiResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User }>> {
    return api.post<{ user: User }>('/auth/login', credentials);
  },

  // Register new user
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return api.post<User>('/auth/register', data);
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/users/me');
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<User>('/users/me', data);
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/auth/password-reset-request', { email });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/auth/password-reset', { token, password: newPassword });
  },

  // Logout
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>('/auth/logout');
  },
};

export default authService; 