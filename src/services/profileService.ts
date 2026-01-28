// src/services/profil.service.ts
import api from './api';

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label?: string;
  telephone?: string;
  address?: string;
  avatar?: string;
  avatar_url?: string;
  initials?: string;
  active: boolean;
  last_login?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  permissions?: string[];
}

export interface ProfileUpdateData {
  name: string;
  email: string;
  telephone?: string;
  address?: string;
  avatar?: File | null;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface TwoFactorSetup {
  qr_code_url: string;
  secret: string;
  recovery_codes: string[];
}

export interface LoginHistory {
  id: number;
  ip_address: string;
  user_agent: string;
  location?: string;
  login_at: string;
  success: boolean;
  reason?: string;
}

export interface NotificationPreference {
  type: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export const profilService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async (): Promise<{ success: boolean; data: Profile }> => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data: ProfileUpdateData): Promise<{ 
    success: boolean; 
    message: string; 
    data: Profile 
  }> => {
    const formData = new FormData();
    
    // Ajouter les champs texte
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (data: PasswordChangeData): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/change-password', data);
    return response.data;
  },

  // Mettre à jour l'avatar
  updateAvatar: async (avatar: File): Promise<{ 
    success: boolean; 
    message: string; 
    avatar_url: string 
  }> => {
    const formData = new FormData();
    formData.append('avatar', avatar);

    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Supprimer l'avatar
  deleteAvatar: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete('/profile/avatar');
    return response.data;
  },

  // Récupérer l'historique de connexion
  getLoginHistory: async (limit: number = 20): Promise<{ 
    success: boolean; 
    data: LoginHistory[] 
  }> => {
    const response = await api.get('/profile/login-history', { 
      params: { limit } 
    });
    return response.data;
  },

  // Récupérer les sessions actives
  getActiveSessions: async (): Promise<{ 
    success: boolean; 
    data: Array<{
      id: string;
      ip_address: string;
      user_agent: string;
      last_activity: string;
      device?: string;
      browser?: string;
      platform?: string;
    }> 
  }> => {
    const response = await api.get('/profile/sessions');
    return response.data;
  },

  // Terminer une session
  terminateSession: async (sessionId: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post(`/profile/sessions/${sessionId}/terminate`);
    return response.data;
  },

  // Terminer toutes les sessions sauf la courante
  terminateOtherSessions: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/sessions/terminate-others');
    return response.data;
  },

  // Récupérer les préférences de notification
  getNotificationPreferences: async (): Promise<{ 
    success: boolean; 
    data: NotificationPreference[] 
  }> => {
    const response = await api.get('/profile/notifications/preferences');
    return response.data;
  },

  // Mettre à jour les préférences de notification
  updateNotificationPreferences: async (preferences: NotificationPreference[]): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.put('/profile/notifications/preferences', { preferences });
    return response.data;
  },

  // Activer/Désactiver les notifications
  toggleNotification: async (type: string, channel: 'email' | 'push' | 'sms'): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post(`/profile/notifications/${type}/toggle/${channel}`);
    return response.data;
  },

  // Authentification à deux facteurs
  // Vérifier si 2FA est activé
  getTwoFactorStatus: async (): Promise<{ 
    success: boolean; 
    enabled: boolean 
  }> => {
    const response = await api.get('/profile/two-factor');
    return response.data;
  },

  // Configurer le 2FA
  setupTwoFactor: async (): Promise<{ 
    success: boolean; 
    data: TwoFactorSetup 
  }> => {
    const response = await api.post('/profile/two-factor/setup');
    return response.data;
  },

  // Confirmer le 2FA
  confirmTwoFactor: async (code: string): Promise<{ 
    success: boolean; 
    message: string; 
    recovery_codes: string[] 
  }> => {
    const response = await api.post('/profile/two-factor/confirm', { code });
    return response.data;
  },

  // Désactiver le 2FA
  disableTwoFactor: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/two-factor/disable');
    return response.data;
  },

  // Générer de nouveaux codes de récupération
  generateNewRecoveryCodes: async (): Promise<{ 
    success: boolean; 
    recovery_codes: string[] 
  }> => {
    const response = await api.post('/profile/two-factor/recovery-codes');
    return response.data;
  },

  // Statistiques du profil
  getProfileStats: async (): Promise<{ 
    success: boolean; 
    data: {
      total_logins: number;
      failed_logins: number;
      last_login: string;
      account_age_days: number;
      products_added: number;
      sales_made: number;
      clients_added: number;
      invoices_generated: number;
    } 
  }> => {
    const response = await api.get('/profile/stats');
    return response.data;
  },

  // Activités récentes
  getRecentActivities: async (limit: number = 10): Promise<{ 
    success: boolean; 
    data: Array<{
      id: number;
      type: string;
      description: string;
      icon: string;
      color: string;
      created_at: string;
      metadata?: any;
    }> 
  }> => {
    const response = await api.get('/profile/activities', { 
      params: { limit } 
    });
    return response.data;
  },

  // Exporter les données personnelles
  exportPersonalData: async (): Promise<Blob> => {
    const response = await api.get('/profile/export-data', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Télécharger les données personnelles
  downloadPersonalData: async (): Promise<void> => {
    const blob = await profilService.exportPersonalData();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-données-aquagestion-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Supprimer le compte (soft delete)
  deleteAccount: async (password: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete('/profile/account', { 
      data: { password } 
    });
    return response.data;
  },

  // Restaurer le compte
  restoreAccount: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/account/restore');
    return response.data;
  },

  // Supprimer définitivement le compte
  forceDeleteAccount: async (password: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete('/profile/account/force', { 
      data: { password } 
    });
    return response.data;
  },

  // Vérifier l'email
  sendVerificationEmail: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/email/verify/send');
    return response.data;
  },

  // Vérifier le code de vérification
  verifyEmail: async (code: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/email/verify', { code });
    return response.data;
  },

  // Changer l'email
  changeEmail: async (newEmail: string, password: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/email/change', { 
      email: newEmail, 
      password 
    });
    return response.data;
  },

  // Obtenir les appareils de confiance
  getTrustedDevices: async (): Promise<{ 
    success: boolean; 
    data: Array<{
      id: number;
      name: string;
      type: string;
      last_used: string;
      ip_address: string;
      created_at: string;
    }> 
  }> => {
    const response = await api.get('/profile/trusted-devices');
    return response.data;
  },

  // Supprimer un appareil de confiance
  removeTrustedDevice: async (deviceId: number): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete(`/profile/trusted-devices/${deviceId}`);
    return response.data;
  },

  // Mettre à jour les préférences d'affichage
  updateDisplayPreferences: async (preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    date_format: string;
    time_format: string;
    items_per_page: number;
    compact_mode: boolean;
    sidebar_collapsed: boolean;
  }): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.put('/profile/display-preferences', preferences);
    return response.data;
  },

  // Obtenir les préférences d'affichage
  getDisplayPreferences: async (): Promise<{ 
    success: boolean; 
    data: any 
  }> => {
    const response = await api.get('/profile/display-preferences');
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  markAllNotificationsAsRead: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/profile/notifications/mark-all-read');
    return response.data;
  },

  // Obtenir les notifications non lues
  getUnreadNotifications: async (): Promise<{ 
    success: boolean; 
    data: Array<{
      id: number;
      type: string;
      title: string;
      message: string;
      read_at: string | null;
      created_at: string;
      metadata?: any;
    }> 
  }> => {
    const response = await api.get('/profile/notifications/unread');
    return response.data;
  }
};