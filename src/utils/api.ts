import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

// Get the base API URL from environment variable
const getBaseApiUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

// Construct API URL - avoid double /api paths
export const constructApiUrl = (endpoint: string) => {
  const baseUrl = getBaseApiUrl();
  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  } else {
    return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
};

// Create axios instance with proper base URL
const api: any = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle URL construction
api.interceptors.request.use((config: any) => {
  if (config.url && !config.url.startsWith('http')) {
    config.url = constructApiUrl(config.url);
  }
  return config;
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error('You do not have permission to perform this action')
          break
        case 404:
          message.error('The requested resource was not found')
          break
        case 500:
          message.error('An internal server error occurred')
          break
        default:
          message.error(error.response.data.message || 'An error occurred')
      }
    } else {
      message.error('Network error occurred')
    }
    return Promise.reject(error)
  }
)

// API methods
export const apiService = {
  // Auth
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),

  // Account
  getTransactions: (params: { page: number; pageSize: number; search?: string }) =>
    api.get('/accounting/transactions', { params }),
  createTransaction: (data: any) =>
    api.post('/accounting/transactions', data),
  updateTransaction: (id: string, data: any) =>
    api.put(`/accounting/transactions/${id}`, data),
  deleteTransaction: (id: string) =>
    api.delete(`/accounting/transactions/${id}`),

  // Products
  getProducts: (params: { page: number; pageSize: number; search?: string }) =>
    api.get('/products', { params }),
  createProduct: (data: any) =>
    api.post('/products', data),
  updateProduct: (id: string, data: any) =>
    api.put(`/products/${id}`, data),
  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),

  // OTA
  getOTAListings: (params: { page: number; pageSize: number; search?: string }) =>
    api.get('/ota/listings', { params }),
  createOTAListing: (data: any) =>
    api.post('/ota/listings', data),
  updateOTAListing: (id: string, data: any) =>
    api.put(`/ota/listings/${id}`, data),
  deleteOTAListing: (id: string) =>
    api.delete(`/ota/listings/${id}`),
}

export default apiService 