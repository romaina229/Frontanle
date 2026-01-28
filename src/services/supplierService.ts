import api from './api';

const supplierService = {
    getAll: () => api.get('/suppliers'),
    getById: (id: number) => api.get(`/suppliers/${id}`),
    create: (supplierData: any) => api.post('/suppliers', supplierData),
    update: (id: number, supplierData: any) => api.put(`/suppliers/${id}`, supplierData),
    delete: (id: number) => api.delete(`/suppliers/${id}`),
    getStats: () => api.get('/suppliers/statistics/summary'),
    getStatistics: () => api.get('/suppliers/statistics/summary'),
};

export default supplierService;