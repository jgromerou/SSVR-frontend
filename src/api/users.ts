import { apiRequest } from './client';
import type { Company } from './companies';

export type Me = {
  id: number;
  email: string;
  main_company_id: number | null;
  created_at: string | null;
  companies: Company[];
};

export const usersApi = {
  getMe: async (): Promise<Me> => {
    const res = await apiRequest<{ user: Me }>('/users/me');
    return res.user;
  },
};
