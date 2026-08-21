import { apiRequest } from './client';
import { createResource } from './resource';

export type Supplier = {
  id: number;
  name: string;
  created_at: string | null;
};

export type SupplierInput = { name: string };

export const suppliersApi = {
  ...createResource<Supplier, SupplierInput, SupplierInput & { id: number }>({
    basePath: '/suppliers',
    listKey: 'suppliers',
    itemKey: 'supplier',
  }),
  getOperations: async (id: number): Promise<unknown[]> => {
    const res = await apiRequest<{ operations: unknown[] }>('/suppliers/operations', { query: { id } });
    return res.operations;
  },
  unify: async (source_id: number, destination_id: number): Promise<Supplier> => {
    const res = await apiRequest<{ supplier: Supplier }>('/suppliers/unify', {
      method: 'PUT',
      body: { source_id, destination_id },
    });
    return res.supplier;
  },
};
