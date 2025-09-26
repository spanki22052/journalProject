export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface ObjectChecklist {
  id: string;
  objectId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}
