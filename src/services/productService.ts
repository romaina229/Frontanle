import api from './api';
import { ApiResponse, Product, ProductFormValues, Category } from '@/types';

export const productService = {
  // Récupérer tous les produits
  getAll: async (params?: any): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Récupérer un produit par ID
  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Créer un nouveau produit
  create: async (productData: ProductFormValues): Promise<ApiResponse<Product>> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Mettre à jour un produit
  update: async (id: number, productData: Partial<ProductFormValues>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Supprimer un produit
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export const categoryService = {
  // Récupérer toutes les catégories
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Créer une nouvelle catégorie
  create: async (categoryData: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  }
};
