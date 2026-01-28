// src/hooks/useSales.ts 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from '../services/saleService';
import { message } from 'antd';

export const useSales = (filters?: any, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['sales', filters, page, limit],
    queryFn: () => saleService.getAll({ ...filters, page, limit }),
    placeholderData: (previousData) => previousData,
  });
};

export const useSale = (id?: number) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleService.getById(id!),
    enabled: !!id,
  });
};

export const useUserSales = (userId: number) => {
  return useQuery({
    queryKey: ['user-sales', userId],
    queryFn: () => saleService.getAll({ user_id: userId }),
    enabled: !!userId,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saleService.create,
    onSuccess: () => {
      message.success('Vente enregistrée avec succès');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      saleService.update(id, data),
    onSuccess: (_, variables) => {
      message.success('Vente mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries(['sale', variables.id]);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saleService.delete,
    onSuccess: () => {
      message.success('Vente supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => saleService.generateInvoice(id),
    onSuccess: () => {
      message.success('Facture générée avec succès');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la génération');
    },
  });
};