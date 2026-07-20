import { Platform } from 'react-native';

import axios, { AxiosError, AxiosInstance } from 'axios';

import { ApiError } from '@/types';
import logger from '@/utils/logger';

// API Base URL from environment
// Note: Android emulator uses 10.0.2.2 to access host machine's localhost
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_ENV !== 'local'
    ? process.env.EXPO_PUBLIC_API_URL
    : getDefaultApiUrl();

class ApiService {
  private api: AxiosInstance;
  private getToken: (() => Promise<string | null>) | null = null;
  private onUnauthorized: (() => void) | null = null;
  private consecutive401s = 0;
  private static readonly SIGN_OUT_AFTER_CONSECUTIVE_401S = 2;

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
            logger.error('Error getting auth token in API interceptor', error as Error);
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
      (response) => {
        this.consecutive401s = 0;
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const status = error.response?.status;
        const errorMessage =
          error.response?.data?.error || error.message || 'An error occurred';

        if (status === 401) {
          this.consecutive401s += 1;
          logger.warn(
            `Unauthorized API request (${this.consecutive401s} consecutive) - token may be expired`
          );
          if (this.consecutive401s >= ApiService.SIGN_OUT_AFTER_CONSECUTIVE_401S) {
            this.consecutive401s = 0;
            // Trigger auto sign-out so the user isn't stuck in a broken session
            this.onUnauthorized?.();
          }
        } else if (status && status >= 500) {
          // Server errors
          logger.error('API server error', new Error(errorMessage), {
            status,
            url: error.config?.url,
            method: error.config?.method,
          });
        } else if (status && status >= 400) {
          // Client errors (except 401)
          logger.warn(`API client error: ${errorMessage}`, {
            status,
            url: error.config?.url,
            method: error.config?.method,
          });
        } else {
          // Network or other errors
          logger.error('API network or unknown error', error as Error, {
            url: error.config?.url,
            method: error.config?.method,
          });
        }

        // Format error for better handling
        const apiError: ApiError & { status?: number } = {
          success: false,
          error: errorMessage,
          details: error.response?.data?.details,
          status,
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

  /**
   * Register a callback invoked when the server returns 401.
   * Used to auto sign-out when the Clerk session expires mid-session.
   */
  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  clearOnUnauthorized() {
    this.onUnauthorized = null;
  }

  // Generic HTTP methods — typed on both response (T) and request payload/params (P)
  async get<T, P = unknown>(url: string, params?: P): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  async post<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async put<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  async patch<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
}

export const apiService = new ApiService();
