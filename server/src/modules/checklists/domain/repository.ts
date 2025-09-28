import type {
  ChecklistData,
  CreateChecklistData,
  UpdateChecklistData,
  ChecklistItemData,
  CreateChecklistItemData,
  UpdateChecklistItemData,
} from "./types";

export interface ChecklistRepository {
  create(data: CreateChecklistData): Promise<ChecklistData>;
  findById(id: string): Promise<ChecklistData | null>;
  findByObjectId(objectId: string): Promise<ChecklistData[]>;
  update(id: string, data: UpdateChecklistData): Promise<ChecklistData | null>;
  delete(id: string): Promise<boolean>;
}

export interface ChecklistItemRepository {
  create(data: CreateChecklistItemData): Promise<ChecklistItemData>;
  findById(id: string): Promise<ChecklistItemData | null>;
  findByChecklistId(checklistId: string): Promise<ChecklistItemData[]>;
  update(
    id: string,
    data: UpdateChecklistItemData
  ): Promise<ChecklistItemData | null>;
  delete(id: string): Promise<boolean>;
}
