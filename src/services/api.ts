// src/services/api.ts - VERSION OPTIMISÉE
import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Configuration API URL
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur requêtes - Ajouter token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur réponses - Gérer erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const response = error.response;
    console.error('[API] Error:', {
      url: error.config?.url,
      status: response?.status,
      data: response?.data
    });

    if (response) {
      switch (response.status) {
        case 401:
          console.warn('[API] 401 Unauthorized - Déconnexion');
          store.dispatch(logout());
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('[API] 403 Forbidden:', response.data.message);
          break;
        case 404:
          console.error('[API] 404 Not Found:', error.config.url);
          break;
        case 422:
          console.error('[API] 422 Validation:', response.data.errors);
          break;
        case 500:
          console.error('[API] 500 Server Error:', response.data.message);
          break;
        default:
          console.error('[API] Error:', response.data.message || 'Erreur inconnue');
      }
    } else {
      console.error('[API] Network error or timeout');
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: (credentials: { email: string; password: string }) => api.post('/login', credentials),
  register: (userData: any) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/me'),
  updateProfile: (data: any) => api.put('/profile', data),

  // Products
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: number) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock/alerts'),

  // Categories
  getCategories: (params?: any) => api.get('/categories', { params }),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/categories/${id}`),

  // Sales
  getSales: (params?: any) => api.get('/sales', { params }),
  getSale: (id: number) => api.get(`/sales/${id}`),
  createSale: (data: any) => api.post('/sales', data),
  cancelSale: (id: number) => api.post(`/sales/${id}/cancel`),
  generateInvoice: (id: number) => api.post(`/sales/${id}/invoice`),
  getSalesStatistics: (period?: string) => api.get('/sales/statistics/summary', { params: { period } }),

  // Clients
  getClients: (params?: any) => api.get('/clients', { params }),
  getClient: (id: number) => api.get(`/clients/${id}`),
  createClient: (data: any) => api.post('/clients', data),
  updateClient: (id: number, data: any) => api.put(`/clients/${id}`, data),
  deleteClient: (id: number) => api.delete(`/clients/${id}`),
  searchClientByPhone: (phone: string) => api.get(`/clients/search/phone/${phone}`),

  // Suppliers
  getSuppliers: (params?: any) => api.get('/suppliers', { params }),
  getSupplier: (id: number) => api.get(`/suppliers/${id}`),
  createSupplier: (data: any) => api.post('/suppliers', data),
  updateSupplier: (id: number, data: any) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id: number) => api.delete(`/suppliers/${id}`),

  // Dashboard
  getDashboardStats: (period?: string) => api.get('/dashboard/stats', { params: { period } }),
  getTopProducts: (params?: any) => api.get('/dashboard/top-products', { params }),
  getRecentSales: (limit?: number) => api.get('/dashboard/recent-sales', { params: { limit } })
};

export default api;