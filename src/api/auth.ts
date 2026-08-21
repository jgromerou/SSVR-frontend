import { apiRequest } from './client';

export type AuthUser = {
  id: number;
  email: string;
  main_company_id: number | null;
  created_at: string | null;
};

type AuthResponse = { user: AuthUser; token: string };

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: { email, password } });
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
  },
};
