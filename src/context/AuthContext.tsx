import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi, type AuthUser } from '../api/auth';
import { getToken, setToken, clearToken } from '../api/client';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'ssvr_auth_user';

const readStoredUser = (): AuthUser | null => {
  if (!getToken()) {
    return null;
  }

  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const persist = (authUser: AuthUser, token: string) => {
    setToken(token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const value: AuthContextValue = {
    user,
    loading: false,
    signIn: async (email, password) => {
      const { user: authUser, token } = await authApi.login(email, password);
      persist(authUser, token);
    },
    signUp: async (email, password) => {
      const { user: authUser, token } = await authApi.register(email, password);
      persist(authUser, token);
    },
    signOut: () => {
      clearToken();
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};
