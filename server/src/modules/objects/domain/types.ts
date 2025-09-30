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
  checkerBlockId?: string;
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
  checkerBlockId?: string;
  checklists?: Array<{
    title: string;
    items?: Array<{
      text: string;
    }>;
  }>;
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
  checkerBlockId?: string;
}

export interface ObjectFilters {
  type?: "PROJECT" | "TASK" | "SUBTASK";
  assignee?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
