import { apiRequest } from './client';
import type { Company } from './companies';

export type MyCompany = Company & { is_main: boolean };

export const userCompaniesApi = {
  getMyCompanies: async (): Promise<MyCompany[]> => {
    const res = await apiRequest<{ companies: MyCompany[] }>('/user-companies/');
    return res.companies;
  },
  join: async (company_id: number): Promise<Company> => {
    const res = await apiRequest<{ company: Company }>('/user-companies/join', { method: 'POST', body: { company_id } });
    return res.company;
  },
  leave: async (company_id: number): Promise<void> => {
    await apiRequest('/user-companies/leave', { method: 'DELETE', body: { company_id } });
  },
  setMain: async (company_id: number): Promise<void> => {
    await apiRequest('/user-companies/main', { method: 'PUT', body: { company_id } });
  },
};
