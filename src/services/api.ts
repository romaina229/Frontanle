import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Configuration API URL
const API_URL = 'http://localhost:8000/api/v1';

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
      config.headers.Authorization = `Bearer \${token}\`;
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
  getProduct: (id: number) => api.get(\`/products/\${id}\`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.put(\`/products/\${id}\`, data),
  deleteProduct: (id: number) => api.delete(\`/products/\${id}\`),
  getLowStock: () => api.get('/products/low-stock/alerts'),
  getCategories: (params?: any) => api.get('/categories', { params }),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: number, data: any) => api.put(\`/categories/\${id}\`, data),
  deleteCategory: (id: number) => api.delete(\`/categories/\${id}\`),
  getSales: (params?: any) => api.get('/sales', { params }),
  getSale: (id: number) => api.get(\`/sales/\${id}\`),
  createSale: (data: any) => api.post('/sales', data),
  cancelSale: (id: number) => api.post(\`/sales/\${id}/cancel\`),
  generateInvoice: (id: number) => api.post(\`/sales/\${id}/invoice\`),
  getSalesStatistics: (period?: string) => api.get('/sales/statistics/summary', { params: { period } }),
  getTopSellingProducts: (params?: any) => api.get('/sales/statistics/top-products', { params }),
  getDailySales: (params?: any) => api.get('/sales/statistics/daily', { params }),
  getClients: (params?: any) => api.get('/clients', { params }),
  getClient: (id: number) => api.get(\`/clients/\${id}\`),
  createClient: (data: any) => api.post('/clients', data),
  updateClient: (id: number, data: any) => api.put(\`/clients/\${id}\`, data),
  deleteClient: (id: number) => api.delete(\`/clients/\${id}\`),
  searchClientByPhone: (phone: string) => api.get(\`/clients/search/phone/\${phone}\`),
  getSuppliers: (params?: any) => api.get('/suppliers', { params }),
  getSupplier: (id: number) => api.get(\`/suppliers/\${id}\`),
  createSupplier: (data: any) => api.post('/suppliers', data),
  updateSupplier: (id: number, data: any) => api.put(\`/suppliers/\${id}\`, data),
  deleteSupplier: (id: number) => api.delete(\`/suppliers/\${id}\`),
  getDashboardStats: (period?: string) => api.get('/dashboard/stats', { params: { period } }),
  getTopProducts: (params?: any) => api.get('/dashboard/top-products', { params }),
  getRecentSales: (limit?: number) => api.get('/dashboard/recent-sales', { params: { limit } })
};

export default api;