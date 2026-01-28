import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductFilters, PaginatedResponse } from '../../types';
import api from '../../services/api';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    inStock: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// Thunks pour les opérations asynchrones
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; filters?: Partial<ProductFilters> } = {}, { getState }) => {
    const state = getState() as { products: ProductState };
    const { page = state.products.pagination.page, filters = {} } = params;
    
    const queryParams = {
      page,
      limit: state.products.pagination.limit,
      ...state.products.filters,
      ...filters
    };
    
    // Nettoyer les paramètres undefined
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key as keyof typeof queryParams] === undefined) {
        delete queryParams[key as keyof typeof queryParams];
      }
    });
    
    const response = await api.get<PaginatedResponse<Product>>('/products', { params: queryParams });
    return response.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string | number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: FormData) => {
    const response = await api.post<Product>('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string | number; data: FormData | Partial<Product> }) => {
    const response = await api.put<Product>(`/products/${id}`, data, 
      data instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    );
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string | number) => {
    await api.delete(`/products/${id}`);
    return id;
  }
);

export const updateStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, quantity, type }: { id: string | number; quantity: number; type: 'add' | 'remove' | 'set' }) => {
    const response = await api.patch<Product>(`/products/${id}/stock`, { quantity, type });
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = {
          ...state.pagination,
          page: action.payload.meta?.currentPage || 1,
          total: action.payload.meta?.total || 0,
          totalPages: action.payload.meta?.lastPage || 1
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des produits';
      })
      
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement du produit';
      })
      
      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload); // Add new product at the beginning
        state.currentProduct = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création du produit';
      })
      
      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update product in list
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        
        // Update current product if it's the one being edited
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la mise à jour du produit';
      })
      
      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove product from list
        state.products = state.products.filter(product => product.id !== action.payload);
        
        // Clear current product if it was deleted
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la suppression du produit';
      })
      
      // updateStock
      .addCase(updateStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update product stock in list
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index].stock = action.payload.stock;
        }
        
        // Update current product stock if it's the one being updated
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct.stock = action.payload.stock;
        }
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la mise à jour du stock';
      });
  }
});

export const { setFilters, setPage, clearCurrentProduct, clearError, resetFilters } = productSlice.actions;

// Sélecteurs TypeScript corrects
export const selectProducts = (state: { products: ProductState }): Product[] => state.products.products;
export const selectCurrentProduct = (state: { products: ProductState }): Product | null => state.products.currentProduct;
export const selectProductsLoading = (state: { products: ProductState }): boolean => state.products.loading;
export const selectProductsError = (state: { products: ProductState }): string | null => state.products.error;
export const selectProductsFilters = (state: { products: ProductState }): ProductFilters => state.products.filters;
export const selectProductsPagination = (state: { products: ProductState }) => state.products.pagination;

export default productSlice.reducer;