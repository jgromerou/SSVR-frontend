import { apiRequest } from './client';
import { createResource } from './resource';

export type Customer = {
  id: number;
  name: string;
  created_at: string | null;
};

export type CustomerInput = { name: string };

export const customersApi = {
  ...createResource<Customer, CustomerInput, CustomerInput & { id: number }>({
    basePath: '/customers',
    listKey: 'customers',
    itemKey: 'customer',
  }),
  getOperations: async (id: number): Promise<unknown[]> => {
    const res = await apiRequest<{ operations: unknown[] }>('/customers/operations', { query: { id } });
    return res.operations;
  },
  unify: async (source_id: number, destination_id: number): Promise<Customer> => {
    const res = await apiRequest<{ customer: Customer }>('/customers/unify', {
      method: 'PUT',
      body: { source_id, destination_id },
    });
    return res.customer;
  },
};
