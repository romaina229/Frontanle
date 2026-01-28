// src/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import { message, notification } from 'antd';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSettingsByGroup = (group: string) => {
  return useQuery({
    queryKey: ['settings', group],
    queryFn: () => settingsService.getByGroup(group),
    enabled: !!group,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Record<string, any>) => settingsService.update(settings),
    onSuccess: (response) => {
      message.success(response.message || 'Paramètres mis à jour avec succès');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => settingsService.createBackup(),
    onSuccess: (response) => {
      message.success(response.message || 'Sauvegarde créée avec succès');
      queryClient.invalidateQueries(['backups']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    },
  });
};

export const useListBackups = () => {
  return useQuery({
    queryKey: ['backups'],
    queryFn: () => settingsService.listBackups(),
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (filename: string) => settingsService.restoreBackup(filename),
    onSuccess: (response) => {
      message.success(response.message || 'Restauration effectuée avec succès');
      queryClient.invalidateQueries(['settings']);
      queryClient.invalidateQueries(['backups']);
      
      // Avertir l'utilisateur qu'il doit se reconnecter
      notification.info({
        message: 'Reconnexion requise',
        description: 'Veuillez vous reconnecter pour appliquer les changements',
        duration: 0,
      });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la restauration');
    },
  });
};

export const useDeleteBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (filename: string) => settingsService.deleteBackup(filename),
    onSuccess: (response) => {
      message.success(response.message || 'Sauvegarde supprimée avec succès');
      queryClient.invalidateQueries(['backups']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: (type: 'all' | 'users' | 'products' | 'sales' | 'clients') => 
      settingsService.exportData(type),
    onSuccess: (blob, type) => {
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aquagestion-${type}-${new Date().toISOString().split('T')[0]}.${type === 'all' ? 'zip' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success(`Export ${type} réussi`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de l\'export');
    },
  });
};

export const useImportData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) => 
      settingsService.importData(file, type),
    onSuccess: (response) => {
      message.success(response.message || 'Import réussi');
      queryClient.invalidateQueries(['settings']);
      // Invalider les caches selon le type importé
      if (type.includes('user')) queryClient.invalidateQueries(['users']);
      if (type.includes('product')) queryClient.invalidateQueries(['products']);
      if (type.includes('sale')) queryClient.invalidateQueries(['sales']);
      if (type.includes('client')) queryClient.invalidateQueries(['clients']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de l\'import');
    },
  });
};

export const useSystemInfo = () => {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: () => settingsService.getSystemInfo(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useSystemStats = () => {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: () => settingsService.getSystemStats(),
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
  });
};

export const useClearCache = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (type?: 'all' | 'config' | 'route' | 'view' | 'cache') => 
      settingsService.clearCache(type),
    onSuccess: (response) => {
      message.success(response.message || 'Cache nettoyé avec succès');
      // Invalider tous les caches du frontend
      queryClient.clear();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors du nettoyage du cache');
    },
  });
};

export const useCheckForUpdates = () => {
  return useQuery({
    queryKey: ['updates'],
    queryFn: () => settingsService.checkForUpdates(),
    staleTime: 60 * 60 * 1000, // 1 heure
  });
};

export const useApplyUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => settingsService.applyUpdate(),
    onSuccess: (response) => {
      message.success(response.message || 'Mise à jour appliquée avec succès');
      queryClient.invalidateQueries(['updates']);
      // Rediriger ou recharger la page
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useTestEmailConnection = () => {
  return useMutation({
    mutationFn: (config?: any) => settingsService.testEmailConnection(config),
    onSuccess: (response) => {
      message.success(response.message || 'Connexion email testée avec succès');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur de connexion email');
    },
  });
};

export const useTestSmsConnection = () => {
  return useMutation({
    mutationFn: (config?: any) => settingsService.testSmsConnection(config),
    onSuccess: (response) => {
      message.success(response.message || 'Connexion SMS testée avec succès');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur de connexion SMS');
    },
  });
};