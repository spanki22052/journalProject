import type {
  ChecklistRepository,
  ChecklistItemRepository,
} from "../domain/repository";
import type {
  ChecklistData,
  CreateChecklistData,
  UpdateChecklistData,
  ChecklistItemData,
  CreateChecklistItemData,
  UpdateChecklistItemData,
} from "../domain/types";
import { prisma } from "../../../infra/prisma.js";

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
    const item = await this.checklistItemRepository.create(data);
    await this.updateObjectProgressByChecklistId(data.checklistId);
    return item;
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
    const existing = await this.checklistItemRepository.findById(id);
    if (!existing) return null;

    const updateData = { ...data } as UpdateChecklistItemData;

    // Если отмечаем как выполненное, устанавливаем completedAt
    if (data.completed === true) {
      updateData.completedAt = new Date();
    }
    // Если отмечаем как невыполненное, убираем completedAt
    else if (data.completed === false) {
      updateData.completedAt = undefined;
    }

    const updated = await this.checklistItemRepository.update(id, updateData);
    await this.updateObjectProgressByChecklistId(existing.checklistId);
    return updated;
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    const existing = await this.checklistItemRepository.findById(id);
    const result = await this.checklistItemRepository.delete(id);
    if (existing) {
      await this.updateObjectProgressByChecklistId(existing.checklistId);
    }
    return result;
  }

  private async updateObjectProgressByChecklistId(
    checklistId: string
  ): Promise<void> {
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      select: { objectId: true },
    });
    if (!checklist) return;

    const [total, completed] = await Promise.all([
      prisma.checklistItem.count({ where: { checklistId } }),
      prisma.checklistItem.count({ where: { checklistId, completed: true } }),
    ]);

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await prisma.object.update({
      where: { id: checklist.objectId },
      data: { progress },
    });
  }
}
