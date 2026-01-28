// src/utils/apiHelpers.ts - VERSION CORRIGÉE AVEC FONCTIONS MANQUANTES

/**
 * Extrait les données d'une réponse API Laravel
 * Gère les différents formats de réponse (paginée, simple, directe)
 */
export const extractApiData = <T = any>(response: any): T[] => {
  console.log('[apiHelpers] extractApiData - Response structure:', {
    hasData: !!response.data,
    hasDataData: !!(response.data?.data),
    hasDataDataData: !!(response.data?.data?.data),
    isArray: Array.isArray(response.data)
  });

  // Réponse paginée Laravel : response.data.data.data
  if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
    console.log('[apiHelpers] Format: Paginated Laravel (data.data.data)');
    return response.data.data.data;
  }
  
  // Réponse simple Laravel Resource : response.data.data
  if (response.data?.data && Array.isArray(response.data.data)) {
    console.log('[apiHelpers] Format: Simple Laravel Resource (data.data)');
    return response.data.data;
  }
  
  // Réponse directe : response.data
  if (response.data && Array.isArray(response.data)) {
    console.log('[apiHelpers] Format: Direct array (data)');
    return response.data;
  }
  
  // Réponse unique (objet)
  if (response.data?.data && !Array.isArray(response.data.data)) {
    console.log('[apiHelpers] Format: Single object (data.data)');
    return [response.data.data];
  }
  
  // Fallback
  console.warn('[apiHelpers] Unknown format, returning empty array');
  return [];
};

/**
 * Gère les erreurs API et retourne un message clair
 */
export const handleApiError = (error: any, defaultMessage: string = 'Erreur'): string => {
  console.error('[apiHelpers] handleApiError:', {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message
  });
  
  // Message direct du serveur
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Erreurs de validation (422)
  if (error.response?.status === 422 && error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const messages = Object.entries(errors)
      .map(([field, msgs]: [string, any]) => {
        const msgArray = Array.isArray(msgs) ? msgs : [msgs];
        return `${field}: ${msgArray.join(', ')}`;
      })
      .join(' | ');
    return messages || defaultMessage;
  }
  
  // Message d'erreur simple
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * Filtre les objets valides ayant les propriétés requises
 */
export const filterValidObjects = <T extends Record<string, any>>(
  items: any[],
  requiredProps: string[]
): T[] => {
  if (!Array.isArray(items)) {
    console.warn('[apiHelpers] filterValidObjects - items is not an array:', typeof items);
    return [];
  }

  return items.filter(item => {
    if (!item || typeof item !== 'object') return false;
    return requiredProps.every(prop => item.hasOwnProperty(prop));
  }) as T[];
};

/**
 * Formate un montant en FCFA
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Formate une date au format français
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formate une date avec l'heure
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Extrait les statistiques d'une réponse API
 */
export const extractStatsData = (response: any): any => {
  console.log('[apiHelpers] extractStatsData - Response:', response.data);
  
  if (response.data?.data) {
    return response.data.data;
  }
  
  if (response.data) {
    return response.data;
  }
  
  return {};
};