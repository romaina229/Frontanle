export interface Sale {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check' | 'mobile';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface CreateSaleDto {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateSaleDto {
  status?: string;
  paymentStatus?: string;
  notes?: string;
}

