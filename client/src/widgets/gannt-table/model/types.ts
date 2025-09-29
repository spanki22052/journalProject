import React from 'react';
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
  loading: boolean;
  error: string | null;
}

export interface GanntTableActions {
  setViewMode: (mode: ExtendedViewMode) => void;
  toggleObjectExpansion: (objectId: string) => void;
  getGanttViewMode: (
    mode: ExtendedViewMode
  ) => import('gantt-task-react').ViewMode;
  getTaskListHeader: () =>
    | React.ComponentType<{
        headerHeight: number;
        rowWidth: string;
        fontFamily: string;
        fontSize: string;
      }>
    | undefined;
  loadData: () => Promise<void>;
}

export interface GanntTableProps {
  selectedOrganization?: string;
  selectedWorks?: string[];
  headerType?: 'custom' | 'empty' | 'minimal' | 'default';
  onOpenFilters?: () => void;
}
