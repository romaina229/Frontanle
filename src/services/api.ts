import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Configuration API URL
const API_URL = 'https://aquagestion-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // CORRIGÉ : backticks non échappés
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const response = error.response;
    
    if (response) {
      switch (response.status) {
        case 401:
          store.dispatch(logout());
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  login: (credentials: { email: string; password: string }) => api.post('/login', credentials),
  register: (userData: any) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/me'),
  updateProfile: (data: any) => api.put('/profile', data),
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: number) => api.get(`/products/${id}`), // CORRIGÉ
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}`, data), // CORRIGÉ
  deleteProduct: (id: number) => api.delete(`/products/${id}`), // CORRIGÉ
  getLowStock: () => api.get('/products/low-stock/alerts'),
  getCategories: (params?: any) => api.get('/categories', { params }),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: number, data: any) => api.put(`/categories/${id}`, data), // CORRIGÉ
  deleteCategory: (id: number) => api.delete(`/categories/${id}`), // CORRIGÉ
  getSales: (params?: any) => api.get('/sales', { params }),
  getSale: (id: number) => api.get(`/sales/${id}`), // CORRIGÉ
  createSale: (data: any) => api.post('/sales', data),
  cancelSale: (id: number) => api.post(`/sales/${id}/cancel`), // CORRIGÉ
  generateInvoice: (id: number) => api.post(`/sales/${id}/invoice`), // CORRIGÉ
  getSalesStatistics: (period?: string) => api.get('/sales/statistics/summary', { params: { period } }),
  getTopSellingProducts: (params?: any) => api.get('/sales/statistics/top-products', { params }),
  getDailySales: (params?: any) => api.get('/sales/statistics/daily', { params }),
  getClients: (params?: any) => api.get('/clients', { params }),
  getClient: (id: number) => api.get(`/clients/${id}`), // CORRIGÉ
  createClient: (data: any) => api.post('/clients', data),
  updateClient: (id: number, data: any) => api.put(`/clients/${id}`, data), // CORRIGÉ
  deleteClient: (id: number) => api.delete(`/clients/${id}`), // CORRIGÉ
  getClientStats: () => api.get('/clients/statistics/summary'),
  searchClients: (params: any) => api.get('/clients', { params }),
  searchClientByPhone: (phone: string) => api.get(`/clients/search/phone/${phone}`), // CORRIGÉ
  getSuppliers: (params?: any) => api.get('/suppliers', { params }),
  getSupplier: (id: number) => api.get(`/suppliers/${id}`), // CORRIGÉ
  createSupplier: (data: any) => api.post('/suppliers', data),
  // Fonctions pour les factures
  getInvoices: (params?: any) => api.get('/invoices', { params }),
  getInvoice: (id: number) => api.get(`/invoices/${id}`),
  getInvoiceItems: (id: number) => api.get(`/invoices/${id}/items`),
  getInvoicePayments: (id: number) => api.get(`/invoices/${id}/payments`),
  downloadInvoice: (id: number) => api.get(`/invoices/${id}/download`, {
    responseType: 'blob'
  }),
  printInvoice: (id: number) => api.get(`/invoices/${id}/print`, {
    responseType: 'blob'
  }),
  updateSupplier: (id: number, data: any) => api.put(`/suppliers/${id}`, data), // CORRIGÉ
  deleteSupplier: (id: number) => api.delete(`/suppliers/${id}`), // CORRIGÉ
  getDashboardStats: (period?: string) => api.get('/dashboard/stats', { params: { period } }),
  getTopProducts: (params?: any) => api.get('/dashboard/top-products', { params }),
  getRecentSales: (limit?: number) => api.get('/dashboard/recent-sales', { params: { limit } })
};

export default api;
