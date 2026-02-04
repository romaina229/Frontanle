// ==========================================
// TYPES PRINCIPAUX - VERSION CORRIGÉE
// ==========================================

// ==========================================
// AUTHENTIFICATION
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'caissier';
  telephone?: string;
  address?: string;
  avatar?: string;
  active: boolean;
  last_login?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  role_label?: string;
  avatar_url?: string;
  initials?: string;
  permissions?: string[];
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: string;
  telephone?: string;
  address?: string;
  avatar?: File | null;
  active?: boolean;
}

export type UserRole = 'admin' | 'gestionnaire' | 'caissier';

export const USER_ROLES = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire', 
  caissier: 'Caissier'
} as const;

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ==========================================
// FORMULAIRES D'AUTHENTIFICATION
// ==========================================

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
}

// ==========================================
// PRODUITS & CATÉGORIES
// ==========================================

export interface Category {
  id: number;
  name: string;
  description?: string;
  couleur?: string;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
  unit_price: number;
  stock_quantity: number;
  unit?: string;
  alert_threshold?: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductFormValues {
  name: string;
  category_id: number;
  unit_price: number;
  stock_quantity: number;
  unit?: string;
  alert_threshold?: number;
  status?: string;
  description?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  status?: string;
  low_stock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// ==========================================
// CLIENTS
// ==========================================

export interface Client {
  id: number;
  name: string;
  telephone: string;
  email?: string | null;
  address?: string | null;
  contact?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientFormValues {
  name: string;
  telephone: string;
  email?: string;
  address?: string;
  contact?: string;
}

// ==========================================
// FOURNISSEURS
// ==========================================

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  telephone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  type_produits?: string;
  delai_livraison?: number;
  conditions_paiement?: string;
  evaluation?: number;
  actif: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierFormValues {
  name: string;
  contact_person?: string;
  telephone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  type_produits?: string;
  delai_livraison?: number;
  conditions_paiement?: string;
  evaluation?: number;
  actif?: boolean;
  notes?: string;
}

// ==========================================
// VENTES
// ==========================================

export interface Sale {
  id: number;
  reference: string;
  date?: string;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  user_id: number;
  client_id?: number;
  client_name?: string;
  client_phone?: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method?: 'cash' | 'mobile_money' | 'card' | 'credit';
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  client?: Client;
  details?: SaleDetail[];
  items?: SaleDetail[];
  invoice?: Invoice;
}

export interface SaleDetail {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price?: number;
  subtotal?: number;
  
  product?: Product;
}

export interface SaleFormValues {
  client_id?: number;
  client_name?: string;
  client_phone?: string;
  payment_method: 'cash' | 'mobile_money' | 'card' | 'credit';
  payment_reference?: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price?: number;
  }[];
}

// ==========================================
// FACTURES
// ==========================================

export interface Invoice {
  id: number;
  sale_id: number;
  invoice_number: string;
  invoice_date: string;
  date?: string;
  total_amount: number;
  status?: string;
  pdf_url?: string;
  created_at?: string;
  
  // Relations
  sale?: Sale;
}

// ==========================================
// MOUVEMENTS DE STOCK
// ==========================================

export interface StockMovement {
  id: number;
  product_id: number;
  product?: Product;
  quantity_in: number;
  quantity_out: number;
  date: string;
  type: 'Vente' | 'Ajustement' | 'Approvisionnement';
  created_at?: string;
}

// ==========================================
// TRANSACTIONS MOBILE MONEY
// ==========================================

export interface Transaction {
  id: number;
  reference?: string;
  operator: 'MTN' | 'MOOV' | 'CELTIS' | 'ORANGE';
  network?: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer';
  amount: number;
  fees?: number;
  net_amount?: number;
  client_name?: string;
  client_phone?: string;
  external_reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  date?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  
  user?: User;
}

export interface TransactionFormValues {
  network?: string;
  operator?: 'MTN' | 'MOOV' | 'CELTIS' | 'ORANGE';
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer';
  amount: number;
  client_name?: string;
  client_phone?: string;
  external_reference?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
}

// ==========================================
// STATISTIQUES DASHBOARD
// ==========================================

export interface DashboardStats {
  total_revenue?: number;
  today_sales?: number;
  todayRevenue?: number;
  mobile_transactions?: number;
  avg_ticket?: number;
  conversion_rate?: number;
  active_clients?: number;
  total_orders?: number;
  total_products?: number;
  productsInStock?: number;
  low_stock_count?: number;
  lowStockAlerts?: number;
  todaySales?: number;
}

// ==========================================
// RÉPONSES API
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    current_page: number;
    total_pages?: number;
    last_page?: number;
    total: number;
    per_page?: number;
    from?: number;
    to?: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// ==========================================
// FILTRES UTILISATEURS
// ==========================================

export interface UserFilters {
  search?: string;
  role?: string;
  active?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ==========================================
// PARAMÈTRES & SYSTÈME
// ==========================================

export interface Setting {
  key: string;
  value: any;
  description?: string;
  group: string;
  created_at?: string;
  updated_at?: string;
}

export interface BackupInfo {
  filename: string;
  size: string;
  created_at: string;
  download_url: string;
}

export interface SystemInfo {
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

export interface SystemStats {
  users_count: number;
  products_count: number;
  sales_count: number;
  clients_count: number;
  disk_usage: number;
  memory_usage: number;
  cpu_usage: number;
  uptime: string;
}

// ==========================================
// TYPES ADDITIONNELS
// ==========================================

// Type pour les rôles (ancien système)
export interface Role {
  id: number;
  label: string;
}

// Export des constantes
export type { UserRole as RoleType };
