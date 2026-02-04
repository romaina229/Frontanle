// src/types/sale.ts
export interface Sale {
  id: number;
  reference: string;
  customerId: string;
  totalAmount: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  items: SaleItem[];
  client?: {
    id: number;
    name: string;
    telephone: string;
    email?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    invoice_date: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  product_id: string;
  product?: {
    id: number;
    name: string;
    unit?: string;
  };
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateSaleDto {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
  paymentMethod: string;
  notes?: string;
}

export type UpdateSaleDto = Partial<CreateSaleDto>;
