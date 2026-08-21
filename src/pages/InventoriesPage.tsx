import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { inventoriesApi, type Inventory, type InventoryDetailInput } from '../api/inventories';
import { productsApi, type Product } from '../api/products';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

type LineDraft = { product_id: string; quantity: string };

const emptyLine = (): LineDraft => ({ product_id: '', quantity: '0' });

export const InventoriesPage = () => {
  const { activeCompanyId } = useCompany();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Inventory | 'new' | null>(null);
  const [viewing, setViewing] = useState<Inventory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  const load = async () => {
    setLoading(true);
    try {
      const [inventoriesList, productsList] = await Promise.all([inventoriesApi.getAll(), productsApi.getAll()]);
      setInventories(inventoriesList);
      setProducts(productsList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los inventarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const openNew = () => {
    setLines([emptyLine()]);
    setEditing('new');
  };

  const openEdit = (inventory: Inventory) => {
    setLines(inventory.details.map((d) => ({ product_id: String(d.product.id), quantity: String(d.quantity) })));
    setEditing(inventory);
  };

  const updateLine = (index: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const details: InventoryDetailInput[] = lines
      .filter((line) => line.product_id)
      .map((line) => ({ product_id: Number(line.product_id), quantity: Number(line.quantity) }));

    try {
      if (editing === 'new') {
        await inventoriesApi.create({ details });
      } else if (editing) {
        await inventoriesApi.update({ id: editing.id, details });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el inventario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este inventario?')) return;
    setError(null);

    try {
      await inventoriesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el inventario');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Inventarios</h1>
        <button type="button" className="primary" onClick={openNew} disabled={!activeCompanyId || products.length === 0}>
          Nuevo inventario
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'N°', render: (i) => i.inventory_number },
            { header: 'Productos contados', render: (i) => i.details.length },
            { header: 'Fecha', render: (i) => (i.created_at ? new Date(i.created_at).toLocaleString() : '—') },
            {
              header: 'Acciones',
              render: (i) => (
                <div className="row-actions">
                  <button type="button" onClick={() => setViewing(i)}>
                    Ver
                  </button>
                  <button type="button" onClick={() => openEdit(i)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(i.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={inventories}
          keyField={(i) => i.id}
        />
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Nuevo inventario' : `Editar inventario #${editing.inventory_number}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit}>
            <div className="line-items">
              {lines.map((line, index) => (
                <div className="line-item" key={index} style={{ gridTemplateColumns: '2fr 1fr auto' }}>
                  <label>
                    Producto
                    <select value={line.product_id} onChange={(e) => updateLine(index, { product_id: e.target.value })} required>
                      <option value="">Selecciona...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Cantidad contada
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, { quantity: e.target.value })}
                      required
                    />
                  </label>
                  <button type="button" className="danger" onClick={() => removeLine(index)} disabled={lines.length === 1}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setLines((prev) => [...prev, emptyLine()])}>
              Agregar línea
            </button>

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

      {viewing && (
        <Modal title={`Inventario #${viewing.inventory_number}`} onClose={() => setViewing(null)}>
          <Table
            columns={[
              { header: 'Producto', render: (d) => d.product.name },
              { header: 'Cantidad contada', render: (d) => d.quantity },
            ]}
            rows={viewing.details}
            keyField={(d) => d.id}
          />
        </Modal>
      )}
    </div>
  );
};
