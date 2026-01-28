import api from './api';

const invoiceService = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: number) => api.get(`/invoices/\${id}\`),
  download: (id: number) => api.get(\`/invoices/\${id}/download\`, { responseType: 'blob' }),
  generate: (saleId: number) => api.post(\`/sales/\${saleId}/invoice\`),
};

export default invoiceService;
