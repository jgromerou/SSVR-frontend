import { useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { companiesApi } from '../api/companies';
import { userCompaniesApi } from '../api/userCompanies';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const CompaniesPage = () => {
  const { companies, activeCompanyId, setActiveCompany, refresh } = useCompany();
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [joinId, setJoinId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const company = await companiesApi.create({ name, logo: logo || null });
      await refresh();
      setActiveCompany(company.id);
      setShowCreate(false);
      setName('');
      setLogo('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la empresa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const company = await userCompaniesApi.join(Number(joinId));
      await refresh();
      setActiveCompany(company.id);
      setShowJoin(false);
      setJoinId('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo unir a la empresa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetMain = async (id: number) => {
    setError(null);
    try {
      await userCompaniesApi.setMain(id);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la empresa principal');
    }
  };

  const handleLeave = async (id: number) => {
    if (!window.confirm('¿Salir de esta empresa?')) return;
    setError(null);

    try {
      await userCompaniesApi.leave(id);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo salir de la empresa');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Empresas</h1>
        <div className="row-actions">
          <button type="button" onClick={() => setShowJoin(true)}>
            Unirme a una empresa
          </button>
          <button type="button" className="primary" onClick={() => setShowCreate(true)}>
            Nueva empresa
          </button>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <Table
        columns={[
          { header: 'Nombre', render: (c) => c.name },
          { header: 'Principal', render: (c) => (c.is_main ? 'Sí' : '') },
          { header: 'Activa', render: (c) => (c.id === activeCompanyId ? 'Sí' : '') },
          {
            header: 'Acciones',
            render: (c) => (
              <div className="row-actions">
                {c.id !== activeCompanyId && (
                  <button type="button" onClick={() => setActiveCompany(c.id)}>
                    Usar
                  </button>
                )}
                {!c.is_main && (
                  <button type="button" onClick={() => handleSetMain(c.id)}>
                    Marcar principal
                  </button>
                )}
                <button type="button" className="danger" onClick={() => handleLeave(c.id)}>
                  Salir
                </button>
              </div>
            ),
          },
        ]}
        rows={companies}
        keyField={(c) => c.id}
        emptyMessage="No perteneces a ninguna empresa todavía"
      />

      {showCreate && (
        <Modal title="Nueva empresa" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <label>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Logo (URL, opcional)
              <input value={logo} onChange={(e) => setLogo(e.target.value)} />
            </label>
            <div className="form-actions">
              <button type="button" onClick={() => setShowCreate(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                Crear
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Unirme a una empresa" onClose={() => setShowJoin(false)}>
          <form onSubmit={handleJoin}>
            <label>
              Id de la empresa
              <input type="number" value={joinId} onChange={(e) => setJoinId(e.target.value)} required />
            </label>
            <div className="form-actions">
              <button type="button" onClick={() => setShowJoin(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                Unirme
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
