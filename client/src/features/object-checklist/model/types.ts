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

export interface ObjectChecklistProps {
  checklist: ObjectChecklist;
  onToggleItem: (itemId: string) => void;
  onAddItem: (taskData: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    priority: 'low' | 'medium' | 'high';
  }) => void;
  onEditItem: (itemId: string, newText: string) => void;
  onDeleteItem: (itemId: string) => void;
}
