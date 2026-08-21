import { createResource } from './resource';

export type InventoryDetail = {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  created_at: string | null;
};

export type Inventory = {
  id: number;
  inventory_number: number;
  created_at: string | null;
  details: InventoryDetail[];
};

export type InventoryDetailInput = { product_id: number; quantity: number };
export type InventoryCreateInput = { details: InventoryDetailInput[] };
export type InventoryUpdateInput = { id: number; details: InventoryDetailInput[] };

export const inventoriesApi = createResource<Inventory, InventoryCreateInput, InventoryUpdateInput>({
  basePath: '/inventories',
  listKey: 'inventories',
  itemKey: 'inventory',
});
