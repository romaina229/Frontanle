// src/services/settings.service.ts
import api from './api';

export interface Setting {
  key: string;
  value: any;
  description?: string;
  group: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsFormData {
  app_name: string;
  currency: string;
  date_format: string;
  items_per_page: number;
  stock_alert_threshold: number;
  default_tax: number;
  invoice_prefix: string;
  language: string;
  timezone: string;
  email_from: string;
  email_from_name: string;
  sms_enabled: boolean;
  notification_enabled: boolean;
  backup_enabled: boolean;
  backup_frequency: string;
  backup_retention_days: number;
}

export interface BackupInfo {
  filename: string;
  size: string;
  created_at: string;
  download_url: string;
}

export const settingsService = {
  // Récupérer tous les paramètres
  getAll: async (): Promise<{ data: Setting[] }> => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Récupérer les paramètres par groupe
  getByGroup: async (group: string): Promise<{ data: Setting[] }> => {
    const response = await api.get(`/settings/group/${group}`);
    return response.data;
  },

  // Mettre à jour les paramètres
  update: async (settings: Record<string, any>): Promise<{ 
    success: boolean; 
    message: string; 
    data?: Setting[] 
  }> => {
    const response = await api.put('/settings', { settings });
    return response.data;
  },

  // Récupérer une valeur spécifique
  getValue: async (key: string): Promise<{ data: any }> => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  // Sauvegardes
  // Créer une sauvegarde
  createBackup: async (): Promise<{ 
    success: boolean; 
    message: string; 
    backup?: BackupInfo 
  }> => {
    const response = await api.post('/settings/backup');
    return response.data;
  },

  // Lister les sauvegardes disponibles
  listBackups: async (): Promise<{ 
    success: boolean; 
    data: BackupInfo[] 
  }> => {
    const response = await api.get('/settings/backups');
    return response.data;
  },

  // Restaurer depuis une sauvegarde
  restoreBackup: async (filename: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/restore', { filename });
    return response.data;
  },

  // Supprimer une sauvegarde
  deleteBackup: async (filename: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete(`/settings/backup/${filename}`);
    return response.data;
  },

  // Exporter les données
  exportData: async (type: 'all' | 'users' | 'products' | 'sales' | 'clients'): Promise<Blob> => {
    const response = await api.get(`/settings/export/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Importer des données
  importData: async (file: File, type: string): Promise<{ 
    success: boolean; 
    message: string; 
    stats?: any 
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Vérifier les mises à jour
  checkForUpdates: async (): Promise<{ 
    success: boolean; 
    update_available: boolean; 
    current_version: string; 
    latest_version: string; 
    changelog?: string 
  }> => {
    const response = await api.get('/settings/updates');
    return response.data;
  },

  // Appliquer les mises à jour
  applyUpdate: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/apply-update');
    return response.data;
  },

  // Paramètres système
  getSystemInfo: async (): Promise<{ 
    success: boolean; 
    data: {
      php_version: string;
      laravel_version: string;
      database: string;
      server: string;
      memory_limit: string;
      max_execution_time: string;
      disk_space: {
        total: string;
        used: string;
        free: string;
        usage_percentage: number;
      };
    } 
  }> => {
    const response = await api.get('/settings/system-info');
    return response.data;
  },

  // Nettoyer le cache
  clearCache: async (type?: 'all' | 'config' | 'route' | 'view' | 'cache'): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/clear-cache', { type });
    return response.data;
  },

  // Logs système
  getLogs: async (type: 'error' | 'access' | 'query' = 'error', lines: number = 100): Promise<{ 
    success: boolean; 
    data: string[] 
  }> => {
    const response = await api.get(`/settings/logs/${type}`, { params: { lines } });
    return response.data;
  },

  // Statistiques système
  getSystemStats: async (): Promise<{ 
    success: boolean; 
    data: {
      users_count: number;
      products_count: number;
      sales_count: number;
      clients_count: number;
      disk_usage: number;
      memory_usage: number;
      cpu_usage: number;
      uptime: string;
    } 
  }> => {
    const response = await api.get('/settings/system-stats');
    return response.data;
  },

  // Tests de connexion
  testEmailConnection: async (config?: {
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: string;
  }): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/test-email', config);
    return response.data;
  },

  testSmsConnection: async (config?: {
    provider: string;
    api_key: string;
    sender: string;
  }): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/test-sms', config);
    return response.data;
  },

  testDatabaseConnection: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/test-database');
    return response.data;
  },

  // Paramètres de sécurité
  updateSecuritySettings: async (settings: {
    password_min_length: number;
    password_requires_numbers: boolean;
    password_requires_special_chars: boolean;
    max_login_attempts: number;
    lockout_duration: number;
    session_timeout: number;
    enable_2fa: boolean;
    enable_ip_whitelist: boolean;
    ip_whitelist: string[];
  }): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.put('/settings/security', settings);
    return response.data;
  },

  // Paramètres de notification
  updateNotificationSettings: async (settings: {
    enable_email_notifications: boolean;
    enable_sms_notifications: boolean;
    enable_push_notifications: boolean;
    low_stock_threshold: number;
    daily_report_time: string;
    weekly_report_day: string;
    monthly_report_day: number;
  }): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.put('/settings/notifications', settings);
    return response.data;
  },

  // Réglages d'impression
  updatePrintSettings: async (settings: {
    printer_name: string;
    paper_size: string;
    margin_top: number;
    margin_bottom: number;
    margin_left: number;
    margin_right: number;
    header_enabled: boolean;
    footer_enabled: boolean;
    logo_enabled: boolean;
    default_copies: number;
  }): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.put('/settings/printing', settings);
    return response.data;
  },

  // Configuration API
  getApiKeys: async (): Promise<{ 
    success: boolean; 
    data: Array<{
      id: number;
      name: string;
      key: string;
      last_used: string | null;
      created_at: string;
    }> 
  }> => {
    const response = await api.get('/settings/api-keys');
    return response.data;
  },

  createApiKey: async (name: string): Promise<{ 
    success: boolean; 
    data: { key: string } 
  }> => {
    const response = await api.post('/settings/api-keys', { name });
    return response.data;
  },

  deleteApiKey: async (id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete(`/settings/api-keys/${id}`);
    return response.data;
  },

  // Réinitialiser les paramètres par défaut
  resetToDefaults: async (): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/reset');
    return response.data;
  },

  // Tester l'impression
  testPrint: async (content: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/test-print', { content });
    return response.data;
  },

  // Envoyer un email de test
  sendTestEmail: async (email: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/test-email-send', { email });
    return response.data;
  },

  // Envoyer un SMS de test
  sendTestSms: async (phone: string): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.post('/settings/test-sms-send', { phone });
    return response.data;
  }
};