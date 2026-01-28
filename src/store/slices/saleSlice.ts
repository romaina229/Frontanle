import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface SaleDetail {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    unit: string;
  };
}

interface Sale {
  id: number;
  reference: string;
  user_id: number;
  client_id: number | null;
  client?: {
    id: number;
    name: string;
    telephone: string;
  };
  user?: {
    id: number;
    name: string;
  };
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'mobile_money' | 'card' | 'credit';
  payment_reference?: string;
  notes?: string;
  details: SaleDetail[];
  invoice?: {
    id: number;
    invoice_number: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

interface SaleState {
  sales: Sale[];
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  filters: {
    search: string;
    status: string;
    payment_method: string;
    date_from: string;
    date_to: string;
    user_id: string;
  };
  statistics: {
    total_sales: number;
    total_revenue: number;
    avg_ticket: number;
    payment_methods: any[];
    top_products: any[];
  } | null;
}

const initialState: SaleState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  filters: {
    search: '',
    status: '',
    payment_method: '',
    date_from: '',
    date_to: '',
    user_id: ''
  },
  statistics: null
};

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/sales', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement');
    }
  }
);

export const fetchSale = createAsyncThunk(
  'sales/fetchSale',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de création');
    }
  }
);

export const cancelSale = createAsyncThunk(
  'sales/cancelSale',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.post(`/sales/${id}/cancel`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur d\'annulation');
    }
  }
);

export const generateInvoice = createAsyncThunk(
  'sales/generateInvoice',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/sales/${id}/invoice`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de génération');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'sales/fetchStatistics',
  async (period: string = 'today', { rejectWithValue }) => {
    try {
      const response = await api.get('/sales/statistics/summary', { params: { period } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement');
    }
  }
);

const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SaleState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addProductToCart: (state, action: PayloadAction<{
      product: any;
      quantity: number;
    }>) => {
      if (state.currentSale) {
        const existingDetail = state.currentSale.details.find(
          d => d.product_id === action.payload.product.id
        );
        
        if (existingDetail) {
          existingDetail.quantity += action.payload.quantity;
          existingDetail.subtotal = existingDetail.quantity * existingDetail.unit_price;
        } else {
          state.currentSale.details.push({
            id: Date.now(), // ID temporaire
            product_id: action.payload.product.id,
            quantity: action.payload.quantity,
            unit_price: action.payload.product.unit_price,
            subtotal: action.payload.quantity * action.payload.product.unit_price,
            product: action.payload.product
          });
        }
        
        state.currentSale.total_amount = state.currentSale.details.reduce(
          (sum, detail) => sum + detail.subtotal, 0
        );
      }
    },
    removeProductFromCart: (state, action: PayloadAction<number>) => {
      if (state.currentSale) {
        state.currentSale.details = state.currentSale.details.filter(
          d => d.product_id !== action.payload
        );
        state.currentSale.total_amount = state.currentSale.details.reduce(
          (sum, detail) => sum + detail.subtotal, 0
        );
      }
    },
    updateCartItemQuantity: (state, action: PayloadAction<{
      product_id: number;
      quantity: number;
    }>) => {
      if (state.currentSale) {
        const detail = state.currentSale.details.find(
          d => d.product_id === action.payload.product_id
        );
        if (detail) {
          detail.quantity = action.payload.quantity;
          detail.subtotal = detail.quantity * detail.unit_price;
          state.currentSale.total_amount = state.currentSale.details.reduce(
            (sum, d) => sum + d.subtotal, 0
          );
        }
      }
    },
    clearCart: (state) => {
      if (state.currentSale) {
        state.currentSale.details = [];
        state.currentSale.total_amount = 0;
      }
    },
    initializeNewSale: (state) => {
      state.currentSale = {
        id: 0,
        reference: '',
        user_id: 0,
        client_id: null,
        total_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        status: 'pending',
        payment_method: 'cash',
        details: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Sale;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Sale
      .addCase(fetchSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload.sale);
        state.total += 1;
        state.currentSale = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Cancel Sale
      .addCase(cancelSale.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(s => s.id === action.payload);
        if (index !== -1) {
          state.sales[index].status = 'cancelled';
        }
        if (state.currentSale?.id === action.payload) {
          state.currentSale.status = 'cancelled';
        }
      })
      .addCase(cancelSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Generate Invoice
      .addCase(generateInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentSale) {
          state.currentSale.invoice = action.payload;
        }
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setFilters,
  setPage,
  clearCurrentSale,
  clearError,
  addProductToCart,
  removeProductFromCart,
  updateCartItemQuantity,
  clearCart,
  initializeNewSale
} = saleSlice.actions;

export const selectSales = (state: { sales: SaleState }) => state.sales.sales;
export const selectCurrentSale = (state: { sales: SaleState }) => state.sales.currentSale;
export const selectSaleLoading = (state: { sales: SaleState }) => state.sales.loading;
export const selectSaleError = (state: { sales: SaleState }) => state.sales.error;
export const selectSaleFilters = (state: { sales: SaleState }) => state.sales.filters;
export const selectSaleStatistics = (state: { sales: SaleState }) => state.sales.statistics;
export const selectSalePagination = (state: { sales: SaleState }) => ({
  page: state.sales.page,
  total: state.sales.total
});

export default saleSlice.reducer;