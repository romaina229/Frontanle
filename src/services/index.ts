import api from './api';
import { ApiResponse, Sale, SaleFormValues, Client, ClientFormValues, Supplier, SupplierFormValues, Invoice } from '@/types';

// Service des ventes
export const saleService = {
  // Récupérer toutes les ventes
  getAll: async (params?: any): Promise<ApiResponse<Sale[]>> => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  // Récupérer une vente par ID
  getById: async (id: number): Promise<ApiResponse<Sale>> => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Créer une nouvelle vente
  create: async (saleData: SaleFormValues): Promise<ApiResponse<Sale>> => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Générer une facture pour une vente
  generateInvoice: async (id: number): Promise<ApiResponse<Invoice>> => {
    const response = await api.post(`/sales/${id}/invoice`);
    return response.data;
  }
};

// Service des clients
export const clientService = {
  // Récupérer tous les clients
  getAll: async (params?: any): Promise<ApiResponse<Client[]>> => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Récupérer un client par ID
  getById: async (id: number): Promise<ApiResponse<Client>> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Créer un nouveau client
  create: async (clientData: ClientFormValues): Promise<ApiResponse<Client>> => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Mettre à jour un client
  update: async (id: number, clientData: Partial<ClientFormValues>): Promise<ApiResponse<Client>> => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Supprimer un client
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

// Service des fournisseurs
export const supplierService = {
  // Récupérer tous les fournisseurs
  getAll: async (params?: any): Promise<ApiResponse<Supplier[]>> => {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  // Récupérer un fournisseur par ID
  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // Créer un nouveau fournisseur
  create: async (supplierData: SupplierFormValues): Promise<ApiResponse<Supplier>> => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  // Mettre à jour un fournisseur
  update: async (id: number, supplierData: Partial<SupplierFormValues>): Promise<ApiResponse<Supplier>> => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  // Supprimer un fournisseur
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};

// Service des factures
export const invoiceService = {
  // Récupérer toutes les factures
  getAll: async (params?: any): Promise<ApiResponse<Invoice[]>> => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  // Récupérer une facture par ID
  getById: async (id: number): Promise<ApiResponse<Invoice>> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Télécharger une facture en PDF
  download: async (id: number): Promise<Blob> => {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Service des rapports
export const reportService = {
  // Rapport des ventes
  getSalesReport: async (params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<any>> => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  // Rapport de l'inventaire
  getInventoryReport: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  // Statistiques du dashboard
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

// src/services/index.ts
export { authService } from './authService';
export { productService } from './productService';
export { categoryService } from './categoryService';
/*export { clientService } from './clientService';*/
/*export { saleService } from './saleService';*/
/*export { dashboardService } from './dashboardService';*/
/*export { reportService } from './reportService';*/
export { userService } from './userService';
export { settingsService } from './settingsService';