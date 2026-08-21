import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { customersApi, type Customer } from '../api/customers';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const CustomersPage = () => {
  const { activeCompanyId } = useCompany();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [name, setName] = useState('');
  const [showUnify, setShowUnify] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCustomers(await customersApi.getAll());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editing === 'new') {
        await customersApi.create({ name });
      } else if (editing) {
        await customersApi.update({ id: editing.id, name });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    setError(null);

    try {
      await customersApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el cliente');
    }
  };

  const handleUnify = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await customersApi.unify(Number(sourceId), Number(destinationId));
      setShowUnify(false);
      setSourceId('');
      setDestinationId('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo unificar los clientes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <div className="row-actions">
          <button type="button" onClick={() => setShowUnify(true)} disabled={customers.length < 2}>
            Unificar
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              setName('');
              setEditing('new');
            }}
            disabled={!activeCompanyId}
          >
            Nuevo cliente
          </button>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'Nombre', render: (c) => c.name },
            {
              header: 'Acciones',
              render: (c) => (
                <div className="row-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setName(c.name);
                      setEditing(c);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(c.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={customers}
          keyField={(c) => c.id}
        />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nuevo cliente' : 'Editar cliente'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <div className="form-actions">
              <button type="button" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showUnify && (
        <Modal title="Unificar clientes" onClose={() => setShowUnify(false)}>
          <form onSubmit={handleUnify}>
            <label>
              Cliente a eliminar
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} required>
                <option value="">Selecciona...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cliente destino
              <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} required>
                <option value="">Selecciona...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="button" onClick={() => setShowUnify(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                Unificar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
