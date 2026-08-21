import { createResource } from './resource';

export type PurchaseDetail = {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  unit_price: number;
  discount: number;
  created_at: string | null;
  subtotal: number;
};

export type Purchase = {
  id: number;
  purchase_number: number;
  supplier: { id: number; name: string } | null;
  created_at: string | null;
  details: PurchaseDetail[];
  total: number;
};

export type PurchaseDetailInput = { product_id: number; quantity: number; unit_price: number; discount?: number };
export type PurchaseInput = { supplier_id?: number | null; details: PurchaseDetailInput[] };

export const purchasesApi = createResource<Purchase, PurchaseInput, PurchaseInput & { id: number }>({
  basePath: '/purchases',
  listKey: 'purchases',
  itemKey: 'purchase',
});
