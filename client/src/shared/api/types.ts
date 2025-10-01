// Базовые типы для API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Типы для объектов
export interface ObjectApi {
  id: string;
  name: string;
  description?: string;
  type: 'PROJECT' | 'TASK' | 'SUBTASK';
  assignee: string;
  startDate: string;
  endDate: string;
  progress: number;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectRequest {
  name: string;
  description?: string;
  type?: 'PROJECT' | 'TASK' | 'SUBTASK';
  assignee: string;
  startDate: string;
  endDate: string;
  progress?: number;
  isExpanded?: boolean;
}

export interface UpdateObjectRequest extends Partial<CreateObjectRequest> {
  id: string;
}

// Типы для работ
export interface WorkApi {
  id: string;
  objectId: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  type: 'TASK' | 'MILESTONE' | 'PROJECT';
  assignee?: string;
  parent?: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkRequest {
  objectId: string;
  name: string;
  startDate: string;
  endDate: string;
  progress?: number;
  type?: 'TASK' | 'MILESTONE' | 'PROJECT';
  assignee?: string;
  parent?: string;
  dependencies?: string[];
}

export interface UpdateWorkRequest extends Partial<CreateWorkRequest> {
  id: string;
}

// Типы для чеклистов
export interface ChecklistApi {
  id: string;
  objectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  items: ChecklistItemApi[];
}

export interface ChecklistItemApi {
  id: string;
  checklistId: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface CreateChecklistRequest {
  objectId: string;
  title: string;
  items?: Omit<ChecklistItemApi, 'id' | 'createdAt' | 'completedAt'>[];
}

export interface UpdateChecklistRequest
  extends Partial<CreateChecklistRequest> {
  id: string;
}

// Типы для фильтров и поиска
export interface ObjectFilters {
  type?: 'PROJECT' | 'TASK' | 'SUBTASK';
  assignee?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export type SearchParams = ObjectFilters;

// Типы для чата
export interface UserType {
  id: string | number;
  name: string;
  avatar?: string;
}

export interface MessageType {
  id: string | number;
  title: string;
  sender: UserType;
  timestamp: Date;
  taskId: string;
  taskName: string;
  recognizedInfo: string;
  files: string[];
}

// Типы для общего чек-листа
export interface CheckListType {
  id: string | number;
  text: string;
  status: 'open' | 'underApproval' | 'approved';
}
