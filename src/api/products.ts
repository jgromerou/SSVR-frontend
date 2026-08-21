import { apiRequest } from './client';
import { createResource } from './resource';

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  initial_stock: number;
  barcode: string | null;
  created_at: string | null;
  unit_of_measure: { id: number; name: string; abbreviation: string };
  categories: { id: number; name: string; parent_category_id: number | null }[];
};

export type ProductInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  initial_stock?: number;
  unit_of_measure_id: number;
  barcode?: string | null;
  category_ids?: number[];
};

export const productsApi = {
  ...createResource<Product, ProductInput, ProductInput & { id: number }>({
    basePath: '/products',
    listKey: 'products',
    itemKey: 'product',
  }),
  getByCategories: async (category_ids: number[]): Promise<Product[]> => {
    const res = await apiRequest<{ products: Product[] }>('/products/by-categories', {
      query: { category_ids: category_ids.join(',') },
    });
    return res.products;
  },
  getOperations: async (id: number): Promise<unknown[]> => {
    const res = await apiRequest<{ operations: unknown[] }>('/products/operations', { query: { id } });
    return res.operations;
  },
  getStock: async (
    id: number
  ): Promise<{
    product_id: number;
    product_name: string;
    initial_stock: number;
    total_purchased: number;
    total_sold: number;
    total_returned: number;
    total_adjusted: number;
    current_stock: number;
  }> => {
    const res = await apiRequest<{ stock: never }>('/products/stock', { query: { id } });
    return res.stock;
  },
};
