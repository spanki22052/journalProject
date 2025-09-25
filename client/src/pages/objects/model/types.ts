export interface ObjectData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  type: 'project';
  assignee: string;
  isExpanded: boolean;
}
