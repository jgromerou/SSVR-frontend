import { apiRequest } from './client';

export type Category = {
  id: number;
  name: string;
  parent_category_id: number | null;
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiRequest<{ categories: Category[] }>('/categories/');
    return res.categories;
  },
  create: async (body: { name: string; parent_category_id?: number | null }): Promise<Category> => {
    const res = await apiRequest<{ category: Category }>('/categories/create', { method: 'POST', body });
    return res.category;
  },
  update: async (body: { id: number; name: string; parent_category_id?: number | null }): Promise<Category> => {
    const res = await apiRequest<{ category: Category }>('/categories/update', { method: 'PUT', body });
    return res.category;
  },
  remove: async (id: number): Promise<void> => {
    await apiRequest('/categories/delete', { method: 'DELETE', body: { id } });
  },
};
