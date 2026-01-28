import api from './api';

const reportService = {
  getSalesReport: (params?: { start_date?: string; end_date?: string }) => 
    api.get('/reports/sales', { params }),
  getInventoryReport: () => api.get('/reports/inventory'),
  getDashboardStats: () => api.get('/dashboard/stats'),
};

export default reportService;
