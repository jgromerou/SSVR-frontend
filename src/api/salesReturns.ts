import { createResource } from './resource';

export type SalesReturnDetail = {
  id: number;
  sale_detail_id: number;
  product: { id: number; name: string };
  quantity: number;
  unit_price: number;
  created_at: string | null;
};

export type SalesReturn = {
  id: number;
  return_number: number;
  sale: { id: number; sale_number: number };
  created_at: string | null;
  details: SalesReturnDetail[];
};

export type SalesReturnDetailInput = { sale_detail_id: number; quantity: number };
export type SalesReturnCreateInput = { sale_id: number; details: SalesReturnDetailInput[] };
export type SalesReturnUpdateInput = { id: number; details: SalesReturnDetailInput[] };

export const salesReturnsApi = createResource<SalesReturn, SalesReturnCreateInput, SalesReturnUpdateInput>({
  basePath: '/sales-returns',
  listKey: 'sales_returns',
  itemKey: 'sales_return',
});
