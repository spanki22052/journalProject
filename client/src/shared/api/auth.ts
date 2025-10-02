import apiClient from './client';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'CONTRACTOR' | 'INSPECTOR';
  };
  message: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CONTRACTOR' | 'INSPECTOR';
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  error: string;
  details?: any;
}

// API endpoints for authentication
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  ROLES: '/auth/roles',
} as const;

// Authentication service
export const authApi = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  // Get available roles
  async getRoles(): Promise<Array<{ value: string; label: string }>> {
    const response = await apiClient.get<Array<{ value: string; label: string }>>(
      AUTH_ENDPOINTS.ROLES
    );
    return response.data;
  },
};

