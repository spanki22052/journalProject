export interface CreateObjectData {
  name: string;
  assignee: string;
  description?: string;
  startDate: string;
  endDate: string;
  polygonCoords: number[][];
}
