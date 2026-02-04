import api from './api';

const reportService = {
  getSalesReport: (params?: { start_date?: string; end_date?: string }) => 
    api.get('/reports/sales', { params }),
  getInventoryReport: () => api.get('/reports/inventory'),
  getDashboardStats: () => api.get('/dashboard/stats'),
  // Ajoutez ces méthodes si elles existent dans votre API
  getClientsReport: (params?: { start_date?: string; end_date?: string }) => 
    api.get('/reports/clients', { params }),
  getTransactionsReport: (params?: { start_date?: string; end_date?: string }) => 
    api.get('/reports/transactions', { params }),
};

export default reportService;