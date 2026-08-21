const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const TOKEN_STORAGE_KEY = 'ssvr_auth_token';

let authToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);

export const getToken = () => authToken;

export const setToken = (token: string) => {
  authToken = token;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = () => {
  authToken = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

let activeCompanyId: number | null = null;

export const setActiveCompanyId = (companyId: number | null) => {
  activeCompanyId = companyId;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const base = API_URL.startsWith('http') ? API_URL : window.location.origin + API_URL;
  const url = new URL(base + path);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (activeCompanyId != null) {
    headers['X-Company-Id'] = String(activeCompanyId);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Ocurrió un error inesperado', response.status);
  }

  return data as T;
};
