import { createResource } from './resource';

export type UnitOfMeasure = {
  id: number;
  name: string;
  abbreviation: string;
  created_at: string | null;
};

export type UnitOfMeasureInput = { name: string; abbreviation: string };

export const unitsOfMeasureApi = createResource<UnitOfMeasure, UnitOfMeasureInput, UnitOfMeasureInput & { id: number }>({
  basePath: '/units-of-measure',
  listKey: 'units_of_measure',
  itemKey: 'unit_of_measure',
});
