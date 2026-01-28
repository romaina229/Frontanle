// src/services/user.service.ts
import api from './api';
import { User, UserFormData, PaginatedResponse, ApiResponse } from '../types';

export const userService = {
  // Récupérer tous les utilisateurs (paginated)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    active?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Créer un nouvel utilisateur
  create: async (userData: UserFormData): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  update: async (id: number, userData: Partial<UserFormData>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Changer le statut actif/inactif
  toggleStatus: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.post(`/users/${id}/toggle`);
    return response.data;
  },

  // Réinitialiser le mot de passe
  resetPassword: async (id: number, passwordData: {
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse<void>> => {
    const response = await api.post(`/users/${id}/reset-password`, passwordData);
    return response.data;
  },

  // Récupérer les permissions de l'utilisateur connecté
  getPermissions: async (): Promise<ApiResponse<{
    permissions: string[];
    role: string;
    role_label: string;
  }>> => {
    const response = await api.get('/user/permissions');
    return response.data;
  },

  // Rechercher des utilisateurs
  search: async (query: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data;
  },

  // Exporter la liste des utilisateurs
  exportUsers: async (format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
    const response = await api.get('/users/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Statistiques des utilisateurs
  getStats: async (): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    lastMonthRegistrations: number;
  }>> => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};