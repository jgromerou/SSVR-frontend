import { createResource } from './resource';

export type StockAdjustment = {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  reason: string;
  created_at: string | null;
};

export type StockAdjustmentInput = { product_id: number; quantity: number; reason: string };

export const stockAdjustmentsApi = createResource<
  StockAdjustment,
  StockAdjustmentInput,
  Partial<StockAdjustmentInput> & { id: number }
>({
  basePath: '/stock-adjustments',
  listKey: 'stock_adjustments',
  itemKey: 'stock_adjustment',
});
