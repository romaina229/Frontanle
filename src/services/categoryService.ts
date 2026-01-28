import api from './api';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  update: async (id: number, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};