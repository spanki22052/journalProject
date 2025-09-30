import { PrismaClient } from "@prisma/client";
import type { ObjectRepository } from "../domain/repository";
import type {
  ObjectData,
  CreateObjectData,
  UpdateObjectData,
  ObjectFilters,
} from "../domain/types";

export class PrismaObjectRepository implements ObjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateObjectData): Promise<ObjectData> {
    return await this.prisma.$transaction(async (tx) => {
      // Создаём объект
      const object = await tx.object.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type || "PROJECT",
          assignee: data.assignee,
          startDate: data.startDate,
          endDate: data.endDate,
          progress: data.progress || 0,
          isExpanded: data.isExpanded || false,
          checkerBlockId: data.checkerBlockId,
        },
      });

      // Создаём чеклисты с пунктами, если они переданы
      if (data.checklists && data.checklists.length > 0) {
        for (const checklistData of data.checklists) {
          const checklist = await tx.checklist.create({
            data: {
              objectId: object.id,
              title: checklistData.title,
            },
          });

          // Создаём пункты чеклиста, если они переданы
          if (checklistData.items && checklistData.items.length > 0) {
            await tx.checklistItem.createMany({
              data: checklistData.items.map((item) => ({
                checklistId: checklist.id,
                text: item.text,
              })),
            });
          }
        }
      }

      return this.mapToObjectData(object);
    });
  }

  async findById(id: string): Promise<ObjectData | null> {
    const object = await this.prisma.object.findUnique({
      where: { id },
    });

    return object ? this.mapToObjectData(object) : null;
  }

  async findAll(filters?: ObjectFilters): Promise<ObjectData[]> {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.assignee) {
      where.assignee = {
        contains: filters.assignee,
        mode: "insensitive",
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const objects = await this.prisma.object.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return objects.map((object: any) => this.mapToObjectData(object));
  }

  async update(id: string, data: UpdateObjectData): Promise<ObjectData | null> {
    const object = await this.prisma.object.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.type && { type: data.type }),
        ...(data.assignee !== undefined && { assignee: data.assignee }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.isExpanded !== undefined && { isExpanded: data.isExpanded }),
        ...(data.checkerBlockId !== undefined && {
          checkerBlockId: data.checkerBlockId,
        }),
      },
    });

    return this.mapToObjectData(object);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.object.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filters?: ObjectFilters): Promise<number> {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.assignee) {
      where.assignee = {
        contains: filters.assignee,
        mode: "insensitive",
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.object.count({ where });
  }

  private mapToObjectData(object: any): ObjectData {
    return {
      id: object.id,
      name: object.name,
      description: object.description,
      type: object.type,
      assignee: object.assignee,
      startDate: object.startDate,
      endDate: object.endDate,
      progress: object.progress,
      isExpanded: object.isExpanded,
      checkerBlockId: object.checkerBlockId || undefined,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
    };
  }
}
