import { Task } from 'gantt-task-react';

export interface ExtendedTask extends Task {
  assignee: string;
  parent?: string;
  isExpanded?: boolean;
}

// Расширенный enum для режимов отображения
export enum ExtendedViewMode {
  Day = 'Day',
  Month = 'Month',
  Quarter = 'Quarter',
  Year = 'Year',
}

export interface GanntTableState {
  viewMode: ExtendedViewMode;
  expandedObjects: Set<string>;
}

export interface GanntTableActions {
  setViewMode: (mode: ExtendedViewMode) => void;
  toggleObjectExpansion: (objectId: string) => void;
  getGanttViewMode: (mode: ExtendedViewMode) => any;
  getTaskListHeader: () => any;
}

export interface GanntTableProps {
  selectedOrganization?: string;
  selectedWorks?: string[];
  headerType?: 'custom' | 'empty' | 'minimal' | 'default';
  onOpenFilters?: () => void;
}
