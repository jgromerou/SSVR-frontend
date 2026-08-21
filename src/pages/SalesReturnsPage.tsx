import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { salesReturnsApi, type SalesReturn, type SalesReturnDetailInput } from '../api/salesReturns';
import { salesApi, type Sale } from '../api/sales';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export const SalesReturnsPage = () => {
  const { activeCompanyId } = useCompany();
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SalesReturn | 'new' | null>(null);
  const [viewing, setViewing] = useState<SalesReturn | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [saleId, setSaleId] = useState('');
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [returnsList, salesList] = await Promise.all([salesReturnsApi.getAll(), salesApi.getAll()]);
      setSalesReturns(returnsList);
      setSales(salesList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las devoluciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const openNew = () => {
    setSaleId('');
    setQuantities({});
    setEditing('new');
  };

  const openEdit = (salesReturn: SalesReturn) => {
    setSaleId(String(salesReturn.sale.id));
    const initial: Record<number, string> = {};
    for (const detail of salesReturn.details) {
      initial[detail.sale_detail_id] = String(detail.quantity);
    }
    setQuantities(initial);
    setEditing(salesReturn);
  };

  const selectedSale = sales.find((s) => s.id === Number(saleId));

  const toggleLine = (saleDetailId: number, checked: boolean) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (checked) {
        next[saleDetailId] = next[saleDetailId] ?? '1';
      } else {
        delete next[saleDetailId];
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const details: SalesReturnDetailInput[] = Object.entries(quantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([saleDetailId, qty]) => ({ sale_detail_id: Number(saleDetailId), quantity: Number(qty) }));

    try {
      if (editing === 'new') {
        await salesReturnsApi.create({ sale_id: Number(saleId), details });
      } else if (editing) {
        await salesReturnsApi.update({ id: editing.id, details });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la devolución');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta devolución?')) return;
    setError(null);

    try {
      await salesReturnsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la devolución');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Devoluciones</h1>
        <button type="button" className="primary" onClick={openNew} disabled={!activeCompanyId || sales.length === 0}>
          Nueva devolución
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'N°', render: (r) => r.return_number },
            { header: 'Venta', render: (r) => `#${r.sale.sale_number}` },
            { header: 'Fecha', render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : '—') },
            {
              header: 'Acciones',
              render: (r) => (
                <div className="row-actions">
                  <button type="button" onClick={() => setViewing(r)}>
                    Ver
                  </button>
                  <button type="button" onClick={() => openEdit(r)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(r.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={salesReturns}
          keyField={(r) => r.id}
        />
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Nueva devolución' : `Editar devolución #${editing.return_number}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit}>
            <label>
              Venta
              <select value={saleId} onChange={(e) => setSaleId(e.target.value)} disabled={editing !== 'new'} required>
                <option value="">Selecciona una venta...</option>
                {sales.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.sale_number} {s.customer ? `— ${s.customer.name}` : ''}
                  </option>
                ))}
              </select>
            </label>

            {selectedSale && (
              <div className="line-items">
                {selectedSale.details.map((detail) => {
                  const checked = quantities[detail.id] !== undefined;
                  return (
                    <div className="line-item" key={detail.id} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                      <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.4rem' }}>
                        <input
                          type="checkbox"
                          style={{ width: 'auto' }}
                          checked={checked}
                          onChange={(e) => toggleLine(detail.id, e.target.checked)}
                        />
                        {detail.product.name} (vendido: {detail.quantity})
                      </label>
                      <label>
                        Cantidad a devolver
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          max={detail.quantity}
                          disabled={!checked}
                          value={quantities[detail.id] ?? ''}
                          onChange={(e) => setQuantities((prev) => ({ ...prev, [detail.id]: e.target.value }))}
                        />
                      </label>
                      <span />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={submitting || !selectedSale}>
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewing && (
        <Modal title={`Devolución #${viewing.return_number}`} onClose={() => setViewing(null)}>
          <Table
            columns={[
              { header: 'Producto', render: (d) => d.product.name },
              { header: 'Cantidad', render: (d) => d.quantity },
              { header: 'Precio unit.', render: (d) => d.unit_price.toFixed(2) },
            ]}
            rows={viewing.details}
            keyField={(d) => d.id}
          />
        </Modal>
      )}
    </div>
  );
};
