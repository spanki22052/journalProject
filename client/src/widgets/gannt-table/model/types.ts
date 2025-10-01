// Удален неиспользуемый импорт React

export interface ExtendedTask {
  id: string | number;
  text: string;
  start: Date;
  end: Date;
  duration?: number;
  progress: number;
  parent?: string | number;
  parentId?: string | number;
  type?: 'task' | 'summary' | 'milestone';
  lazy?: boolean;
  assignee?: string;
  isExpanded?: boolean;
  dependencies?: string[];
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  workstream?: string;
  assignedTo?: string;
}

// Расширенный enum для режимов отображения
export enum ExtendedViewMode {
  Day = 'Day',
  Month = 'Month',
  Quarter = 'Quarter',
  Year = 'Year',
}

export interface DropdownOptions {
  priorities: string[];
  workstreams: string[];
  assignees: string[];
}

export interface EditorShapeItem {
  key: string;
  type: string;
  label: string;
  options?: Array<{ id: string; label: string }>;
  config?: { placeholder: string };
  when?: (task: ExtendedTask) => boolean;
}

export interface GanntTableState {
  viewMode: ExtendedViewMode;
  expandedObjects: Set<string>;
  loading: boolean;
  error: string | null;
  dropdownOptions: DropdownOptions;
  editorShape: string;
  scales: Array<{
    unit: 'hour' | 'day' | 'week' | 'month' | 'year';
    step: number;
    format: string;
  }>;
  columns: Array<{
    id: string;
    header: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
  }>;
}

export interface GanntTableActions {
  setViewMode: (mode: ExtendedViewMode) => void;
  toggleObjectExpansion: (objectId: string) => void;
  loadData: () => Promise<void>;
  getGanttViewMode: () => string;
  getGanttScales: (mode: ExtendedViewMode) => Array<{
    unit: 'hour' | 'day' | 'week' | 'month' | 'year';
    step: number;
    format: string;
  }>;
}

export interface GanntTableProps {
  selectedOrganization?: string;
  selectedWorks?: string[];
  headerType?: 'custom' | 'empty' | 'minimal' | 'default';
  onOpenFilters?: () => void;
}
