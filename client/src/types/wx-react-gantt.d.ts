declare module 'wx-react-gantt' {
  import { ReactNode } from 'react';

  export interface GanttTask {
    id: string | number;
    text: string;
    start: Date;
    end: Date;
    duration?: number;
    progress: number;
    parent?: string | number;
    type?: 'task' | 'summary' | 'milestone';
    lazy?: boolean;
    assignee?: string;
    isExpanded?: boolean;
    dependencies?: string[];
    color?: string;
    priority?: 'low' | 'medium' | 'high';
  }

  export interface GanttLink {
    id: string | number;
    source: string | number;
    target: string | number;
    type: 'e2e' | 's2s' | 'e2s' | 's2e';
  }

  export interface GanttScale {
    unit: 'hour' | 'day' | 'week' | 'month' | 'year';
    step: number;
    format: string;
  }

  export interface GanttProps {
    tasks: GanttTask[];
    links?: GanttLink[];
    scales?: GanttScale[];
    columns?: any[];
    start?: Date;
    end?: Date;
    lengthUnit?: 'hour' | 'day' | 'week' | 'month' | 'year';
    cellWidth?: number;
    cellHeight?: number;
    scaleHeight?: number;
    readonly?: boolean;
    cellBorders?: boolean;
    editorShape?: string;
    highlightTime?: Date;
    init?: (api: any) => void;
    taskTemplate?: (task: GanttTask) => ReactNode;
    markers?: any[];
    taskTypes?: any;
    selected?: string | number;
    activeTask?: string | number;
    zoom?: number;
    baselines?: any[];
  }

  export const Gantt: React.FC<GanttProps>;
}
