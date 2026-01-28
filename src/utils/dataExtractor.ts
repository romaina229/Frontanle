// src/utils/dataExtractor.ts

/**
 * Extrait un tableau de données de n'importe quelle structure de réponse API
 */
export const extractDataArray = (responseData: any): any[] => {
  console.log('Extraction données depuis:', responseData);
  
  // Si c'est déjà un tableau
  if (Array.isArray(responseData)) {
    return responseData;
  }
  
  // Si c'est un objet Laravel paginé typique
  if (responseData && typeof responseData === 'object') {
    // Structure 1: { data: [...], success: true }
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    // Structure 2: { products: [...], clients: [...] }
    const arrayKeys = Object.keys(responseData).filter(key => 
      Array.isArray(responseData[key])
    );
    
    if (arrayKeys.length > 0) {
      return responseData[arrayKeys[0]];
    }
    
    // Structure 3: Pagination Laravel avec items()
    if (responseData.items && Array.isArray(responseData.items)) {
      return responseData.items;
    }
    
    // Structure 4: Pagination Laravel directe
    if (responseData.current_page !== undefined) {
      // C'est un objet Paginator, extraire les données
      const data = responseData.data || [];
      return Array.isArray(data) ? data : [];
    }
  }
  
  // Si aucune correspondance, retourner tableau vide
  console.warn('Structure inconnue, retour tableau vide');
  return [];
};

/**
 * Extrait les métadonnées de pagination
 */
export const extractPagination = (responseData: any): any => {
  if (responseData && typeof responseData === 'object') {
    return {
      total: responseData.total || responseData.meta?.total || 0,
      current: responseData.current_page || responseData.meta?.current_page || 1,
      pageSize: responseData.per_page || responseData.meta?.per_page || 15,
      lastPage: responseData.last_page || responseData.meta?.last_page || 1
    };
  }
  return null;
};