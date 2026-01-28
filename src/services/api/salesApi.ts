import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Sale {
  id: string;
}

interface CreateSaleDto {
}

interface UpdateSaleDto {
}

interface SalesResponse {
  sales: Sale[];
  totalCount: number;
  totalPages: number;
}

interface SalesQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Sale'],
  endpoints: (builder) => ({
    getSales: builder.query<SalesResponse, SalesQueryParams>({
      query: (params) => ({
        url: '/sales',
        params: {
          page: params.page,
          limit: params.limit,
          search: params.searchTerm,
          status: params.status !== 'all' ? params.status : undefined,
          startDate: params.startDate,
          endDate: params.endDate,
          customerId: params.customerId,
        },
      }),
      providesTags: ['Sale'],
    }),
    
    getSaleById: builder.query<Sale, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sale', id }],
    }),
    
    createSale: builder.mutation<Sale, CreateSaleDto>({
      query: (newSale) => ({
        url: '/sales',
        method: 'POST',
        body: newSale,
      }),
      invalidatesTags: ['Sale'],
    }),
    
    updateSale: builder.mutation<Sale, { id: string; data: UpdateSaleDto }>({
      query: ({ id, data }) => ({
        url: `/sales/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Sale', id },
        'Sale',
      ],
    }),
    
    deleteSale: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sale'],
    }),
    
    getSalesStats: builder.query({
      query: (params) => ({
        url: '/sales/stats',
        params,
      }),
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useGetSalesStatsQuery,
} = salesApi;
