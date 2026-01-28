// services/saleService.ts
import api from './api';

const saleService = {
  getAll: (params?: any) => api.get('/sales', { params }),
  
  getById: (id: string) => api.get(`/sales/${id}`),
  
  create: (data: any) => api.post('/sales', data),
  
  update: (id: string, data: any) => api.put(`/sales/${id}`, data),
  
  delete: (id: string) => api.delete(`/sales/${id}`),
  
  cancel: (id: string) => api.post(`/sales/${id}/cancel`),
  
  generateInvoice: (id: string) => api.post(`/sales/${id}/invoice`),
  
  getStatistics: () => api.get('/sales/statistics/summary'),
  
  
  getSaleWithDetails: async (id: string) => {
    try {
      
      const response = await api.get(`/sales/${id}/details`);
      return response;
    } catch (error) {
      
      const response = await api.get(`/sales/${id}`, {
        params: { with: 'client,user,details.product,invoice' }
      });
      return response;
    }
  }
};

export default saleService;