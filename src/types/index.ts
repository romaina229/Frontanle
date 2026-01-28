// Types pour l'authentification
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

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UserFilters {
  search?: string;
  role?: string;
  active?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Rôles disponibles
export const USER_ROLES = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire', 
  caissier: 'Caissier'
} as const;

export interface Sale {
  id: number;
  date: string;
  total_amount: number;
  user_id: number;
  client_id?: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  client?: Client;
  details?: SaleDetail[];
  invoice?: Invoice;
}

export interface SaleDetail {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  
  product?: Product;
}

export interface Invoice {
  id: number;
  sale_id: number;
  invoice_number: string;
  date: string;
  total_amount: number;
  pdf_url?: string;
  created_at: string;
}

// ancienne version des rôles
export interface Role {
  id: number;
  label: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Types pour les produits
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
  unit_price: number;
  stock_quantity: number;
  status: 'Disponible' | 'Rupture' | 'Inactif';
  created_at: string;
}

// Types pour les clients
export interface Client {
  id: number;
  name: string;
  contact: string;
  address: string;
  created_at: string;
}

// Types pour les fournisseurs
export interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
  created_at: string;
}

// Types pour les ventes
export interface Sale {
  id: number;
  date: string;
  total_amount: number;
  user_id: number;
  user?: User;
  client_id?: number;
  client?: Client;
  details?: SaleDetail[];
}

export interface SaleDetail {
  id: number;
  sale_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
}

// Types pour les factures
export interface Invoice {
  id: number;
  sale_id: number;
  sale?: Sale;
  invoice_number: string;
  date: string;
  total_amount: number;
}

// Types pour les mouvements de stock
export interface StockMovement {
  id: number;
  product_id: number;
  product?: Product;
  quantity_in: number;
  quantity_out: number;
  date: string;
  type: 'Vente' | 'Ajustement' | 'Approvisionnement';
}

// Types pour les transactions Mobile Money
export interface Transaction {
  id: number;
  network: string;
  type: string;
  amount: number;
  date: string;
  user_id: number;
  user?: User;
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  todayRevenue: number;
  productsInStock: number;
  todaySales: number;
  lowStockAlerts: number;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    current_page: number;
    total_pages: number;
    total: number;
  };
}

// Types pour les formulaires
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

export interface ProductFormValues {
  name: string;
  category_id: number;
  unit_price: number;
  stock_quantity: number;
  status: string;
}

export interface SaleFormValues {
  client_id?: number;
  products: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface ClientFormValues {
  name: string;
  contact: string;
  address: string;
}

export interface SupplierFormValues {
  name: string;
  contact: string;
  address: string;
}

export interface TransactionFormValues {
  network: string;
  type: string;
  amount: number;
}

// src/types/index.ts (ajouter)
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

export type UserRole = keyof typeof USER_ROLES;
