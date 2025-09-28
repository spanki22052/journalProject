import type {
  ChecklistRepository,
  ChecklistItemRepository,
} from "../domain/repository.js";
import type {
  ChecklistData,
  CreateChecklistData,
  UpdateChecklistData,
  ChecklistItemData,
  CreateChecklistItemData,
  UpdateChecklistItemData,
} from "../domain/types.js";

export class ChecklistUseCases {
  constructor(
    private checklistRepository: ChecklistRepository,
    private checklistItemRepository: ChecklistItemRepository
  ) {}

  async createChecklist(data: CreateChecklistData): Promise<ChecklistData> {
    return this.checklistRepository.create(data);
  }

  async getChecklistById(id: string): Promise<ChecklistData | null> {
    return this.checklistRepository.findById(id);
  }

  async getChecklistsByObjectId(objectId: string): Promise<ChecklistData[]> {
    return this.checklistRepository.findByObjectId(objectId);
  }

  async updateChecklist(
    id: string,
    data: UpdateChecklistData
  ): Promise<ChecklistData | null> {
    return this.checklistRepository.update(id, data);
  }

  async deleteChecklist(id: string): Promise<boolean> {
    return this.checklistRepository.delete(id);
  }

  // Checklist Items
  async createChecklistItem(
    data: CreateChecklistItemData
  ): Promise<ChecklistItemData> {
    return this.checklistItemRepository.create(data);
  }

  async getChecklistItemById(id: string): Promise<ChecklistItemData | null> {
    return this.checklistItemRepository.findById(id);
  }

  async getChecklistItemsByChecklistId(
    checklistId: string
  ): Promise<ChecklistItemData[]> {
    return this.checklistItemRepository.findByChecklistId(checklistId);
  }

  async updateChecklistItem(
    id: string,
    data: UpdateChecklistItemData
  ): Promise<ChecklistItemData | null> {
    const updateData = { ...data };

    // Если отмечаем как выполненное, устанавливаем completedAt
    if (data.completed === true) {
      updateData.completedAt = new Date();
    }
    // Если отмечаем как невыполненное, убираем completedAt
    else if (data.completed === false) {
      updateData.completedAt = undefined;
    }

    return this.checklistItemRepository.update(id, updateData);
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    return this.checklistItemRepository.delete(id);
  }
}
