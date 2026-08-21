import { useEffect, useState, type FormEvent } from 'react';
import { useCompany } from '../context/CompanyContext';
import { productsApi, type Product } from '../api/products';
import { unitsOfMeasureApi, type UnitOfMeasure } from '../api/unitsOfMeasure';
import { categoriesApi, type Category } from '../api/categories';
import { ApiError } from '../api/client';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

type ProductStock = Awaited<ReturnType<typeof productsApi.getStock>>;

export const ProductsPage = () => {
  const { activeCompanyId } = useCompany();
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [stockView, setStockView] = useState<ProductStock | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [initialStock, setInitialStock] = useState('0');
  const [unitId, setUnitId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [productsList, unitsList, categoriesList] = await Promise.all([
        productsApi.getAll(),
        unitsOfMeasureApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setProducts(productsList);
      setUnits(unitsList);
      setCategories(categoriesList);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) load();
  }, [activeCompanyId]);

  const openNew = () => {
    setName('');
    setDescription('');
    setPrice('');
    setInitialStock('0');
    setUnitId('');
    setBarcode('');
    setCategoryIds([]);
    setEditing('new');
  };

  const openEdit = (product: Product) => {
    setName(product.name);
    setDescription(product.description ?? '');
    setPrice(product.price != null ? String(product.price) : '');
    setInitialStock(String(product.initial_stock));
    setUnitId(String(product.unit_of_measure.id));
    setBarcode(product.barcode ?? '');
    setCategoryIds(product.categories.map((c) => c.id));
    setEditing(product);
  };

  const toggleCategory = (id: number) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      description: description || null,
      price: price ? Number(price) : null,
      initial_stock: Number(initialStock),
      unit_of_measure_id: Number(unitId),
      barcode: barcode || null,
      category_ids: categoryIds,
    };

    try {
      if (editing === 'new') {
        await productsApi.create(payload);
      } else if (editing) {
        await productsApi.update({ id: editing.id, ...payload });
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setError(null);

    try {
      await productsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el producto');
    }
  };

  const handleViewStock = async (id: number) => {
    setError(null);
    try {
      setStockView(await productsApi.getStock(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo obtener el stock');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Productos</h1>
        <button type="button" className="primary" onClick={openNew} disabled={!activeCompanyId}>
          Nuevo producto
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          columns={[
            { header: 'Nombre', render: (p) => p.name },
            { header: 'Precio', render: (p) => (p.price != null ? p.price.toFixed(2) : '—') },
            { header: 'Stock inicial', render: (p) => p.initial_stock },
            { header: 'Unidad', render: (p) => p.unit_of_measure.abbreviation },
            { header: 'Código de barras', render: (p) => p.barcode ?? '—' },
            {
              header: 'Acciones',
              render: (p) => (
                <div className="row-actions">
                  <button type="button" onClick={() => handleViewStock(p.id)}>
                    Stock
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
          rows={products}
          keyField={(p) => p.id}
        />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nuevo producto' : 'Editar producto'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Descripción
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <div className="form-row">
              <label>
                Precio
                <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
              </label>
              <label>
                Stock inicial
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Unidad de medida
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} required>
                  <option value="">Selecciona...</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.abbreviation})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Código de barras
                <input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
              </label>
            </div>
            <label>Categorías</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
              {categories.map((c) => (
                <label key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.3rem', margin: 0 }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={categoryIds.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
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

      {stockView && (
        <Modal title={`Stock: ${stockView.product_name}`} onClose={() => setStockView(null)}>
          <ul>
            <li>Stock inicial: {stockView.initial_stock}</li>
            <li>Total comprado: {stockView.total_purchased}</li>
            <li>Total vendido: {stockView.total_sold}</li>
            <li>Total devuelto: {stockView.total_returned}</li>
            <li>Total ajustado: {stockView.total_adjusted}</li>
            <li>
              <strong>Stock actual: {stockView.current_stock}</strong>
            </li>
          </ul>
        </Modal>
      )}
    </div>
  );
};
