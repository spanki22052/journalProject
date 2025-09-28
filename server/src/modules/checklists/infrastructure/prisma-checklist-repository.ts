import { PrismaClient } from "@prisma/client";
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

export class PrismaChecklistRepository implements ChecklistRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChecklistData): Promise<ChecklistData> {
    const checklist = await this.prisma.checklist.create({
      data: {
        objectId: data.objectId,
        title: data.title,
      },
      include: {
        items: true,
      },
    });

    return this.mapToChecklistData(checklist);
  }

  async findById(id: string): Promise<ChecklistData | null> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return checklist ? this.mapToChecklistData(checklist) : null;
  }

  async findByObjectId(objectId: string): Promise<ChecklistData[]> {
    const checklists = await this.prisma.checklist.findMany({
      where: { objectId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return checklists.map((checklist: any) =>
      this.mapToChecklistData(checklist)
    );
  }

  async update(
    id: string,
    data: UpdateChecklistData
  ): Promise<ChecklistData | null> {
    const checklist = await this.prisma.checklist.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
      },
      include: {
        items: true,
      },
    });

    return this.mapToChecklistData(checklist);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.checklist.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToChecklistData(checklist: any): ChecklistData {
    return {
      id: checklist.id,
      objectId: checklist.objectId,
      title: checklist.title,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
      items: checklist.items.map((item: any) => ({
        id: item.id,
        checklistId: item.checklistId,
        text: item.text,
        completed: item.completed,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
      })),
    };
  }
}

export class PrismaChecklistItemRepository implements ChecklistItemRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChecklistItemData): Promise<ChecklistItemData> {
    const item = await this.prisma.checklistItem.create({
      data: {
        checklistId: data.checklistId,
        text: data.text,
      },
    });

    return this.mapToChecklistItemData(item);
  }

  async findById(id: string): Promise<ChecklistItemData | null> {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id },
    });

    return item ? this.mapToChecklistItemData(item) : null;
  }

  async findByChecklistId(checklistId: string): Promise<ChecklistItemData[]> {
    const items = await this.prisma.checklistItem.findMany({
      where: { checklistId },
      orderBy: { createdAt: "asc" },
    });

    return items.map((item: any) => this.mapToChecklistItemData(item));
  }

  async update(
    id: string,
    data: UpdateChecklistItemData
  ): Promise<ChecklistItemData | null> {
    const item = await this.prisma.checklistItem.update({
      where: { id },
      data: {
        ...(data.text && { text: data.text }),
        ...(data.completed !== undefined && { completed: data.completed }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt,
        }),
      },
    });

    return this.mapToChecklistItemData(item);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.checklistItem.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToChecklistItemData(item: any): ChecklistItemData {
    return {
      id: item.id,
      checklistId: item.checklistId,
      text: item.text,
      completed: item.completed,
      completedAt: item.completedAt,
      createdAt: item.createdAt,
    };
  }
}
