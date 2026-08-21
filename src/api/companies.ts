import { apiRequest } from './client';

export type Company = {
  id: number;
  name: string;
  logo: string | null;
  created_at: string | null;
};

export const companiesApi = {
  getActiveCompany: async (): Promise<Company> => {
    const res = await apiRequest<{ company: Company }>('/companies/');
    return res.company;
  },
  create: async (body: { name: string; logo?: string | null }): Promise<Company> => {
    const res = await apiRequest<{ company: Company }>('/companies/create', { method: 'POST', body });
    return res.company;
  },
  update: async (body: { name: string; logo?: string | null }): Promise<Company> => {
    const res = await apiRequest<{ company: Company }>('/companies/update', { method: 'PUT', body });
    return res.company;
  },
};
