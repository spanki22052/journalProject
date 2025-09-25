export interface GanttTask {
  start: Date;
  end: Date;
  name: string;
  id: string;
  type: 'task' | 'milestone';
  progress: number;
  isDisabled?: boolean;
  assignee: string;
  styles?: {
    progressColor: string;
    backgroundColor: string;
  };
  dependencies?: string[];
}

export interface GanttColumn {
  name: string;
  value: string;
  width: number;
}
