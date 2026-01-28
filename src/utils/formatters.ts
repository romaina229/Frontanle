import { format, formatDistance, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate un montant en devise
 */
export const formatCurrency = (
  amount: number | string, 
  currency: string = 'FCFA', 
  locale: string = 'fr-FR'
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0 ${currency}`;
  }
  
  // Format spécifique pour le FCFA (pas de décimales)
  if (currency === 'FCFA') {
    return `${Math.round(numAmount).toLocaleString(locale)} ${currency}`;
  }
  
  return `${numAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${currency}`;
};

/**
 * Formate une date
 */
export const formatDate = (
  date: string | Date, 
  pattern: string = 'dd/MM/yyyy HH:mm'
): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern, { locale: fr });
  } catch (error) {
    return String(date);
  }
};

/**
 * Formate une date relative (il y a X temps)
 */
export const formatRelativeDate = (date: string | Date): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { 
      addSuffix: true,
      locale: fr 
    });
  } catch (error) {
    return String(date);
  }
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '');
  
  // Format pour le Bénin
  if (cleaned.startsWith('229')) {
    const rest = cleaned.slice(3);
    if (rest.length === 8) {
      return `+229 ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6)}`;
    }
  }
  
  // Format générique
  if (cleaned.length > 2) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  }
  
  return phone;
};

/**
 * Formate une quantité avec unité
 */
export const formatQuantity = (quantity: number, unit: string = 'kg'): string => {
  if (isNaN(quantity)) return '0';
  
  // Afficher les décimales seulement si nécessaire
  const formatted = quantity % 1 === 0 
    ? quantity.toLocaleString('fr-FR')
    : quantity.toLocaleString('fr-FR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
  
  return `${formatted} ${unit}`;
};

/**
 * Tronque un texte avec ellipse
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

/**
 * Formate un statut avec couleur
 */
export const formatStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    // Produits
    'available': { text: 'Disponible', color: 'success' },
    'out_of_stock': { text: 'Rupture', color: 'error' },
    'discontinued': { text: 'Discontinué', color: 'default' },
    
    // Ventes
    'pending': { text: 'En attente', color: 'warning' },
    'completed': { text: 'Payé', color: 'success' },
    'cancelled': { text: 'Annulé', color: 'error' },
    
    // Transactions
    'en attente': { text: 'En attente', color: 'warning' },
    'completé': { text: 'Complété', color: 'success' },
    'échoué': { text: 'Échoué', color: 'error' },
    
    // Factures
    'draft': { text: 'Brouillon', color: 'default' },
    'sent': { text: 'Envoyée', color: 'processing' },
    'paid': { text: 'Payée', color: 'success' },
    'overdue': { text: 'En retard', color: 'error' },
    
    // Utilisateurs
    'active': { text: 'Actif', color: 'success' },
    'inactive': { text: 'Inactif', color: 'error' },
    
    // Rôles
    'admin': { text: 'Administrateur', color: 'red' },
    'gestionnaire': { text: 'Gestionnaire', color: 'orange' },
    'caissier': { text: 'Caissier', color: 'green' }
  };
  
  return statusMap[status] || { text: status, color: 'default' };
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formate la durée en minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
};

/**
 * Génère des initiales à partir d'un nom
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+229|229)?\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Capitalise la première lettre
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formate un nombre avec séparateurs de milliers
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR');
};

/**
 * Calcule le pourcentage de progression
 */
export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Formate les frais d'opérateur mobile
 */
export const calculateMobileFees = (operator: string, amount: number): number => {
  switch (operator) {
    case 'MTN':
      return Math.min(500, Math.max(50, amount * 0.01));
    case 'MOOV':
      return Math.min(400, Math.max(40, amount * 0.009));
    case 'CELTIS':
      return Math.min(450, Math.max(45, amount * 0.0095));
    case 'ORANGE':
      return Math.min(450, Math.max(45, amount * 0.009));
    default:
      return 0;
  }
};



export default {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  formatPhoneNumber,
  formatQuantity,
  truncateText,
  formatStatus,
  formatPercentage,
  formatDuration,
  getInitials,
  isValidEmail,
  isValidPhone,
  capitalize,
  formatNumber,
  calculatePercentage,
  calculateMobileFees
};