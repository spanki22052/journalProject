export interface ChecklistItemData {
  id: string;
  checklistId: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface ChecklistData {
  id: string;
  objectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  items: ChecklistItemData[];
}

export interface CreateChecklistData {
  objectId: string;
  title: string;
}

export interface UpdateChecklistData {
  title?: string;
}

export interface CreateChecklistItemData {
  checklistId: string;
  text: string;
}

export interface UpdateChecklistItemData {
  text?: string;
  completed?: boolean;
  completedAt?: Date;
}
