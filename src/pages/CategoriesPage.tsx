import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { categoriesApi, type Category } from '../api/categories';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const CategoriesPage = () => {
  const { activeCompanyId } = useCompany();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await categoriesApi.getAll());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const openNew = () => {
    setName('');
    setParentId('');
    setEditing('new');
  };

  const openEdit = (category: Category) => {
    setName(category.name);
    setParentId(category.parent_category_id ? String(category.parent_category_id) : '');
    setEditing(category);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const parent_category_id = parentId ? Number(parentId) : null;

      if (editing === 'new') {
        await categoriesApi.create({ name, parent_category_id });
      } else if (editing) {
        await categoriesApi.update({ id: editing.id, name, parent_category_id });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    setError(null);

    try {
      await categoriesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría');
    }
  };

  const parentName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? '';

  return (
    <div>
      <div className="page-header">
        <h1>Categorías</h1>
        <button type="button" className="primary" onClick={openNew} disabled={!activeCompanyId}>
          Nueva categoría
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'Nombre', render: (c) => c.name },
            { header: 'Categoría padre', render: (c) => parentName(c.parent_category_id) },
            {
              header: 'Acciones',
              render: (c) => (
                <div className="row-actions">
                  <button type="button" onClick={() => openEdit(c)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(c.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={categories}
          keyField={(c) => c.id}
        />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nueva categoría' : 'Editar categoría'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Categoría padre (opcional)
              <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">Ninguna</option>
                {categories
                  .filter((c) => editing === 'new' || c.id !== editing.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
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
