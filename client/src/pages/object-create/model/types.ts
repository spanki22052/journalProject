export interface CreateObjectData {
  name: string;
  assignee: string;
  type: 'project' | 'task' | 'subtask';
  description?: string;
  polygonCoords: number[][];
}
