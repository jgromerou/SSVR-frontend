import { apiRequest } from './client';

type ApiEnvelope = { status: string; statusCode: number; message: string } & Record<string, unknown>;

export const createResource = <T, CreateInput, UpdateInput extends { id: number }>(config: {
  basePath: string;
  listKey: string;
  itemKey: string;
}) => {
  const { basePath, listKey, itemKey } = config;

  return {
    getAll: async (): Promise<T[]> => {
      const res = await apiRequest<ApiEnvelope>(`${basePath}/`);
      return res[listKey] as T[];
    },
    getOne: async (id: number): Promise<T> => {
      const res = await apiRequest<ApiEnvelope>(`${basePath}/detail`, { query: { id } });
      return res[itemKey] as T;
    },
    create: async (body: CreateInput): Promise<T> => {
      const res = await apiRequest<ApiEnvelope>(`${basePath}/create`, { method: 'POST', body });
      return res[itemKey] as T;
    },
    update: async (body: UpdateInput): Promise<T> => {
      const res = await apiRequest<ApiEnvelope>(`${basePath}/update`, { method: 'PUT', body });
      return res[itemKey] as T;
    },
    remove: async (id: number): Promise<void> => {
      await apiRequest(`${basePath}/delete`, { method: 'DELETE', body: { id } });
    },
  };
};
