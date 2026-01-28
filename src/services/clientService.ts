// clientService.ts
import api from './api';
export const getStats = () => api.get('/clients/statistics/summary');


const clientService = {
    getAll: () => api.get('/clients'),
    getStats: () => api.get('/clients/statistics/summary'),
    getById: (id: number) => api.get(`/clients/${id}`),
    create: (clientData: any) => api.post('/clients', clientData),
    update: (id: number, clientData: any) => api.put(`/clients/${id}`, clientData),
    delete: (id: number) => api.delete(`/clients/${id}`),
    upstatus: (id: number, statusData: any) => api.patch(`/clients/${id}/status`, statusData),
};

export default clientService;
