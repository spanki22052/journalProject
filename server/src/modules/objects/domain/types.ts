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
}

export interface ObjectFilters {
  type?: "PROJECT" | "TASK" | "SUBTASK";
  assignee?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
