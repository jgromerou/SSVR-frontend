import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/companies', label: 'Empresas' },
  { to: '/categories', label: 'Categorías' },
  { to: '/products', label: 'Productos' },
  { to: '/customers', label: 'Clientes' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/units-of-measure', label: 'Unidades de medida' },
  { to: '/sales', label: 'Ventas' },
  { to: '/purchases', label: 'Compras' },
  { to: '/sales-returns', label: 'Devoluciones' },
  { to: '/stock-adjustments', label: 'Ajustes de stock' },
  { to: '/inventories', label: 'Inventarios' },
];

export const Layout = () => {
  const { user, signOut } = useAuth();
  const { companies, activeCompanyId, setActiveCompany, loading } = useCompany();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">SSVR</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="company-switcher">
            {loading ? (
              <span>Cargando empresas...</span>
            ) : companies.length > 0 ? (
              <select value={activeCompanyId ?? ''} onChange={(e) => setActiveCompany(Number(e.target.value))}>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                    {company.is_main ? ' (principal)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span>Sin empresas — crea una en "Empresas"</span>
            )}
          </div>
          <div className="user-info">
            <span>{user?.email}</span>
            <button type="button" onClick={() => signOut()}>
              Salir
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
