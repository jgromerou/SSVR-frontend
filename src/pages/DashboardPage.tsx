import { useCompany } from '../context/CompanyContext';

export const DashboardPage = () => {
  const { companies, activeCompanyId } = useCompany();
  const activeCompany = companies.find((company) => company.id === activeCompanyId);

  return (
    <div>
      <div className="page-header">
        <h1>Inicio</h1>
      </div>
      <div className="card">
        {activeCompany ? (
          <p>
            Empresa activa: <strong>{activeCompany.name}</strong>
          </p>
        ) : (
          <p>No tienes una empresa activa. Crea o únete a una empresa en la sección "Empresas".</p>
        )}
        <p style={{ color: 'var(--text-muted)' }}>
          Usa el menú lateral para gestionar categorías, productos, clientes, proveedores, ventas, compras,
          devoluciones, ajustes de stock e inventarios.
        </p>
      </div>
    </div>
  );
};
