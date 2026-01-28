// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilService } from '../services/profileService';
import { message } from 'antd';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profilService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => profilService.updateProfile(data),
    onSuccess: (response) => {
      message.success(response.message || 'Profil mis à jour avec succès');
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['user-permissions']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: any) => profilService.changePassword(data),
    onSuccess: (response) => {
      message.success(response.message || 'Mot de passe changé avec succès');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (avatar: File) => profilService.updateAvatar(avatar),
    onSuccess: (response) => {
      message.success(response.message || 'Photo de profil mise à jour');
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour de la photo');
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profilService.deleteAvatar(),
    onSuccess: (response) => {
      message.success(response.message || 'Photo de profil supprimée');
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useLoginHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ['login-history', limit],
    queryFn: () => profilService.getLoginHistory(limit),
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => profilService.getActiveSessions(),
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
  });
};

export const useTerminateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => profilService.terminateSession(sessionId),
    onSuccess: (response) => {
      message.success(response.message || 'Session terminée');
      queryClient.invalidateQueries(['active-sessions']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la terminaison');
    },
  });
};

export const useTerminateOtherSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profilService.terminateOtherSessions(),
    onSuccess: (response) => {
      message.success(response.message || 'Autres sessions terminées');
      queryClient.invalidateQueries(['active-sessions']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la terminaison');
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => profilService.getNotificationPreferences(),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: any[]) => profilService.updateNotificationPreferences(preferences),
    onSuccess: (response) => {
      message.success(response.message || 'Préférences mises à jour');
      queryClient.invalidateQueries(['notification-preferences']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useProfileStats = () => {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => profilService.getProfileStats(),
  });
};

export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: () => profilService.getRecentActivities(limit),
  });
};

export const useExportPersonalData = () => {
  return useMutation({
    mutationFn: () => profilService.downloadPersonalData(),
    onSuccess: () => {
      message.success('Données personnelles exportées avec succès');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de l\'export');
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (password: string) => profilService.deleteAccount(password),
    onSuccess: (response) => {
      message.success(response.message || 'Compte supprimé avec succès');
      // Déconnecter l'utilisateur
      localStorage.removeItem('token');
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useTwoFactorStatus = () => {
  return useQuery({
    queryKey: ['two-factor-status'],
    queryFn: () => profilService.getTwoFactorStatus(),
  });
};

export const useSetupTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profilService.setupTwoFactor(),
    onSuccess: () => {
      queryClient.invalidateQueries(['two-factor-status']);
    },
  });
};

export const useConfirmTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (code: string) => profilService.confirmTwoFactor(code),
    onSuccess: (response) => {
      message.success(response.message || '2FA activé avec succès');
      queryClient.invalidateQueries(['two-factor-status']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Code invalide');
    },
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profilService.disableTwoFactor(),
    onSuccess: (response) => {
      message.success(response.message || '2FA désactivé avec succès');
      queryClient.invalidateQueries(['two-factor-status']);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Erreur lors de la désactivation');
    },
  });
};