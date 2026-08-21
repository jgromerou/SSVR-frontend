import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { purchasesApi, type Purchase, type PurchaseDetailInput } from '../api/purchases';
import { suppliersApi, type Supplier } from '../api/suppliers';
import { productsApi, type Product } from '../api/products';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

type LineDraft = { product_id: string; quantity: string; unit_price: string; discount: string };

const emptyLine = (): LineDraft => ({ product_id: '', quantity: '1', unit_price: '0', discount: '0' });

export const PurchasesPage = () => {
  const { activeCompanyId } = useCompany();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Purchase | 'new' | null>(null);
  const [viewing, setViewing] = useState<Purchase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  const load = async () => {
    setLoading(true);
    try {
      const [purchasesList, suppliersList, productsList] = await Promise.all([
        purchasesApi.getAll(),
        suppliersApi.getAll(),
        productsApi.getAll(),
      ]);
      setPurchases(purchasesList);
      setSuppliers(suppliersList);
      setProducts(productsList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const openNew = () => {
    setSupplierId('');
    setLines([emptyLine()]);
    setEditing('new');
  };

  const openEdit = (purchase: Purchase) => {
    setSupplierId(purchase.supplier ? String(purchase.supplier.id) : '');
    setLines(
      purchase.details.map((d) => ({
        product_id: String(d.product.id),
        quantity: String(d.quantity),
        unit_price: String(d.unit_price),
        discount: String(d.discount),
      }))
    );
    setEditing(purchase);
  };

  const updateLine = (index: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const previewTotal = lines.reduce((acc, line) => {
    return acc + Number(line.quantity || 0) * Number(line.unit_price || 0) - Number(line.discount || 0);
  }, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const details: PurchaseDetailInput[] = lines
      .filter((line) => line.product_id)
      .map((line) => ({
        product_id: Number(line.product_id),
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price),
        discount: Number(line.discount || 0),
      }));

    try {
      if (editing === 'new') {
        await purchasesApi.create({ supplier_id: supplierId ? Number(supplierId) : null, details });
      } else if (editing) {
        await purchasesApi.update({ id: editing.id, supplier_id: supplierId ? Number(supplierId) : null, details });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la compra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta compra?')) return;
    setError(null);

    try {
      await purchasesApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la compra');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Compras</h1>
        <button type="button" className="primary" onClick={openNew} disabled={!activeCompanyId || products.length === 0}>
          Nueva compra
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'N°', render: (p) => p.purchase_number },
            { header: 'Proveedor', render: (p) => p.supplier?.name ?? '—' },
            { header: 'Total', render: (p) => p.total.toFixed(2) },
            { header: 'Fecha', render: (p) => (p.created_at ? new Date(p.created_at).toLocaleString() : '—') },
            {
              header: 'Acciones',
              render: (p) => (
                <div className="row-actions">
                  <button type="button" onClick={() => setViewing(p)}>
                    Ver
                  </button>
                  <button type="button" onClick={() => openEdit(p)}>
                    Editar
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(p.id)}>
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
          rows={purchases}
          keyField={(p) => p.id}
        />
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Nueva compra' : `Editar compra #${editing.purchase_number}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit}>
            <label>
              Proveedor (opcional)
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Sin proveedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="line-items">
              {lines.map((line, index) => (
                <div className="line-item" key={index}>
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
                    Cantidad
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, { quantity: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Precio unit.
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.unit_price}
                      onChange={(e) => updateLine(index, { unit_price: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Descuento
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.discount}
                      onChange={(e) => updateLine(index, { discount: e.target.value })}
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

            <p className="totals">Total: {previewTotal.toFixed(2)}</p>

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
        <Modal title={`Compra #${viewing.purchase_number}`} onClose={() => setViewing(null)}>
          <Table
            columns={[
              { header: 'Producto', render: (d) => d.product.name },
              { header: 'Cantidad', render: (d) => d.quantity },
              { header: 'Precio unit.', render: (d) => d.unit_price.toFixed(2) },
              { header: 'Descuento', render: (d) => d.discount.toFixed(2) },
              { header: 'Subtotal', render: (d) => d.subtotal.toFixed(2) },
            ]}
            rows={viewing.details}
            keyField={(d) => d.id}
          />
          <p className="totals">Total: {viewing.total.toFixed(2)}</p>
        </Modal>
      )}
    </div>
  );
};
