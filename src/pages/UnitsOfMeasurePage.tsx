import { useEffect, useState, type FormEvent } from 'react';
import { unitsOfMeasureApi, type UnitOfMeasure } from '../api/unitsOfMeasure';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const UnitsOfMeasurePage = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UnitOfMeasure | 'new' | null>(null);
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setUnits(await unitsOfMeasureApi.getAll());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las unidades de medida');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editing === 'new') {
        await unitsOfMeasureApi.create({ name, abbreviation });
      } else if (editing) {
        await unitsOfMeasureApi.update({ id: editing.id, name, abbreviation });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la unidad de medida');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta unidad de medida?')) return;
    setError(null);

    try {
      await unitsOfMeasureApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la unidad de medida');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Unidades de medida</h1>
        <button
          type="button"
          className="primary"
          onClick={() => {
            setName('');
            setAbbreviation('');
            setEditing('new');
          }}
        >
          Nueva unidad
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'Nombre', render: (u) => u.name },
            { header: 'Abreviatura', render: (u) => u.abbreviation },
            {
              header: 'Acciones',
              render: (u) => (
                <div className="row-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setName(u.name);
                      setAbbreviation(u.abbreviation);
                      setEditing(u);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(u.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={units}
          keyField={(u) => u.id}
        />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nueva unidad de medida' : 'Editar unidad de medida'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Abreviatura
              <input value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} required />
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
    </div>
  );
};
