import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { stockAdjustmentsApi, type StockAdjustment } from '../api/stockAdjustments';
import { productsApi, type Product } from '../api/products';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const StockAdjustmentsPage = () => {
  const { activeCompanyId } = useCompany();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<StockAdjustment | 'new' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [adjustmentsList, productsList] = await Promise.all([stockAdjustmentsApi.getAll(), productsApi.getAll()]);
      setAdjustments(adjustmentsList);
      setProducts(productsList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los ajustes de stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const openNew = () => {
    setProductId('');
    setQuantity('');
    setReason('');
    setEditing('new');
  };

  const openEdit = (adjustment: StockAdjustment) => {
    setProductId(String(adjustment.product.id));
    setQuantity(String(adjustment.quantity));
    setReason(adjustment.reason);
    setEditing(adjustment);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editing === 'new') {
        await stockAdjustmentsApi.create({ product_id: Number(productId), quantity: Number(quantity), reason });
      } else if (editing) {
        await stockAdjustmentsApi.update({
          id: editing.id,
          product_id: Number(productId),
          quantity: Number(quantity),
          reason,
        });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el ajuste de stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este ajuste de stock?')) return;
    setError(null);

    try {
      await stockAdjustmentsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el ajuste de stock');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Ajustes de stock</h1>
        <button type="button" className="primary" onClick={openNew} disabled={!activeCompanyId || products.length === 0}>
          Nuevo ajuste
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'Producto', render: (a) => a.product.name },
            { header: 'Cantidad', render: (a) => a.quantity },
            { header: 'Motivo', render: (a) => a.reason },
            { header: 'Fecha', render: (a) => (a.created_at ? new Date(a.created_at).toLocaleString() : '—') },
            {
              header: 'Acciones',
              render: (a) => (
                <div className="row-actions">
                  <button type="button" onClick={() => openEdit(a)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(a.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={adjustments}
          keyField={(a) => a.id}
        />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nuevo ajuste de stock' : 'Editar ajuste de stock'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            <label>
              Producto
              <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                <option value="">Selecciona...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cantidad (positiva suma stock, negativa lo resta)
              <input type="number" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </label>
            <label>
              Motivo
              <input value={reason} onChange={(e) => setReason(e.target.value)} required />
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
