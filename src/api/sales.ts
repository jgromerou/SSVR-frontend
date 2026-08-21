import { createResource } from './resource';

export type SaleDetail = {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  unit_price: number;
  discount: number;
  created_at: string | null;
  subtotal: number;
};

export type Sale = {
  id: number;
  sale_number: number;
  customer: { id: number; name: string } | null;
  created_at: string | null;
  details: SaleDetail[];
  total: number;
};

export type SaleDetailInput = { product_id: number; quantity: number; unit_price: number; discount?: number };
export type SaleInput = { customer_id?: number | null; details: SaleDetailInput[] };

export const salesApi = createResource<Sale, SaleInput, SaleInput & { id: number }>({
  basePath: '/sales',
  listKey: 'sales',
  itemKey: 'sale',
});
