// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { User, UserFormData, UserFilters } from '../types';
import { message } from 'antd';

export const useUsers = (filters?: UserFilters, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['users', filters, page, limit],
    queryFn: () => userService.getAll({ ...filters, page, limit }),
    placeholderData: (previousData) => previousData,
  });
};

export const useUser = (id?: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UserFormData) => userService.create(userData),
    onSuccess: () => {
      message.success('Utilisateur créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) => 
      userService.update(id, data),
    onSuccess: (_, variables) => {
      message.success('Utilisateur mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries(['user', variables.id]);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      message.success('Utilisateur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.toggleStatus(id),
    onSuccess: (data, id) => {
      const newStatus = data.data.active ? 'activé' : 'désactivé';
      message.success(`Utilisateur ${newStatus} avec succès`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries(['user', id]);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, passwordData }: { 
      id: number; 
      passwordData: { new_password: string; new_password_confirmation: string } 
    }) => userService.resetPassword(id, passwordData),
    onSuccess: () => {
      message.success('Mot de passe réinitialisé avec succès');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    },
  });
};

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => userService.getPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};