import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { userCompaniesApi, type MyCompany } from '../api/userCompanies';
import { setActiveCompanyId } from '../api/client';
import { useAuth } from './AuthContext';

type CompanyContextValue = {
  companies: MyCompany[];
  activeCompanyId: number | null;
  loading: boolean;
  setActiveCompany: (id: number) => void;
  refresh: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

const STORAGE_KEY = 'ssvr_active_company_id';

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<MyCompany[]>([]);
  const [activeCompanyId, setActiveCompanyIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCompanies([]);
      setActiveCompanyIdState(null);
      setActiveCompanyId(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const list = await userCompaniesApi.getMyCompanies();
    setCompanies(list);

    const stored = Number(localStorage.getItem(STORAGE_KEY));
    const storedIsValid = list.some((company) => company.id === stored);
    const mainCompany = list.find((company) => company.is_main);
    const nextActive = storedIsValid ? stored : (mainCompany?.id ?? list[0]?.id ?? null);

    setActiveCompanyIdState(nextActive);
    setActiveCompanyId(nextActive);

    if (nextActive != null) {
      localStorage.setItem(STORAGE_KEY, String(nextActive));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActiveCompany = (id: number) => {
    setActiveCompanyIdState(id);
    setActiveCompanyId(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  };

  return (
    <CompanyContext.Provider value={{ companies, activeCompanyId, loading, setActiveCompany, refresh }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);

  if (!ctx) {
    throw new Error('useCompany must be used within CompanyProvider');
  }

  return ctx;
};
