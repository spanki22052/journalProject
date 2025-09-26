import { lazy } from 'react';

export const GanntTable = lazy(() =>
  import('./ui/GanntTable').then(module => ({ default: module.GanntTable }))
);
export { useGanntTable } from './hooks/useGanntTable';
export {
  CustomTaskListHeader,
  EmptyTaskListHeader,
  MinimalTaskListHeader,
} from './ui/CustomTaskListHeader';
export type {
  ExtendedTask,
  ExtendedViewMode,
  GanntTableState,
  GanntTableActions,
  GanntTableProps,
} from './model/types';
