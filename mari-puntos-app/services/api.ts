import { ApiError } from '@/types';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Platform } from 'react-native';

// API Base URL from environment
// Note: Android emulator uses 10.0.2.2 to access host machine's localhost
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

class ApiService {
  private api: AxiosInstance;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add Clerk JWT token
    this.api.interceptors.request.use(
      async (config) => {
        if (this.getToken) {
          try {
            const token = await this.getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error getting auth token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - Clerk will handle re-authentication
          console.error('Unauthorized request - token may be expired');
        }
        
        // Format error for better handling
        const apiError: ApiError = {
          success: false,
          error: error.response?.data?.error || error.message || 'An error occurred',
          details: error.response?.data?.details,
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Set the token getter function (should be Clerk's getToken method)
   */
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  /**
   * Clear the token getter
   */
  clearTokenGetter() {
    this.getToken = null;
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
}

export const apiService = new ApiService();
