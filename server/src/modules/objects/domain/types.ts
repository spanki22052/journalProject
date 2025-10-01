export interface ObjectData {
  id: string;
  name: string;
  description?: string;
  type: "PROJECT" | "TASK" | "SUBTASK";
  assignee: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  isExpanded: boolean;
  polygon?: string; // WKT POLYGON строка (для внутреннего использования)
  polygonCoords?: number[][]; // Координаты для фронтенда [lat, lng][]
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateObjectData {
  name: string;
  description?: string;
  type?: "PROJECT" | "TASK" | "SUBTASK";
  assignee: string;
  startDate: Date;
  endDate: Date;
  progress?: number;
  isExpanded?: boolean;
  polygon?: string; // WKT POLYGON строка
}

export interface UpdateObjectData {
  name?: string;
  description?: string;
  type?: "PROJECT" | "TASK" | "SUBTASK";
  assignee?: string;
  startDate?: Date;
  endDate?: Date;
  progress?: number;
  isExpanded?: boolean;
  polygon?: string; // WKT POLYGON строка
}

export interface ObjectFilters {
  type?: "PROJECT" | "TASK" | "SUBTASK";
  assignee?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
