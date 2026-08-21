import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { suppliersApi, type Supplier } from '../api/suppliers';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const SuppliersPage = () => {
  const { activeCompanyId } = useCompany();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | 'new' | null>(null);
  const [name, setName] = useState('');
  const [showUnify, setShowUnify] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSuppliers(await suppliersApi.getAll());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los proveedores');
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
        await suppliersApi.create({ name });
      } else if (editing) {
        await suppliersApi.update({ id: editing.id, name });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    setError(null);

    try {
      await suppliersApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el proveedor');
    }
  };

  const handleUnify = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await suppliersApi.unify(Number(sourceId), Number(destinationId));
      setShowUnify(false);
      setSourceId('');
      setDestinationId('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo unificar los proveedores');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Proveedores</h1>
        <div className="row-actions">
          <button type="button" onClick={() => setShowUnify(true)} disabled={suppliers.length < 2}>
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
            Nuevo proveedor
          </button>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'Nombre', render: (s) => s.name },
            {
              header: 'Acciones',
              render: (s) => (
                <div className="row-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setName(s.name);
                      setEditing(s);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(s.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={suppliers}
          keyField={(s) => s.id}
        />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nuevo proveedor' : 'Editar proveedor'} onClose={() => setEditing(null)}>
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
        <Modal title="Unificar proveedores" onClose={() => setShowUnify(false)}>
          <form onSubmit={handleUnify}>
            <label>
              Proveedor a eliminar
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} required>
                <option value="">Selecciona...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Proveedor destino
              <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} required>
                <option value="">Selecciona...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
