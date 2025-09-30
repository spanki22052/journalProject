import type { ObjectRepository } from "../domain/repository";
import type {
  ObjectData,
  CreateObjectData,
  UpdateObjectData,
  ObjectFilters,
} from "../domain/types";

export class ObjectUseCases {
  constructor(private objectRepository: ObjectRepository) {}

  async createObject(data: CreateObjectData): Promise<ObjectData> {
    return this.objectRepository.create(data);
  }

  async getObjectById(id: string): Promise<ObjectData | null> {
    return this.objectRepository.findById(id);
  }

  async getAllObjects(filters?: ObjectFilters): Promise<ObjectData[]> {
    return this.objectRepository.findAll(filters);
  }

  async updateObject(
    id: string,
    data: UpdateObjectData
  ): Promise<ObjectData | null> {
    return this.objectRepository.update(id, data);
  }

  async deleteObject(id: string): Promise<boolean> {
    return this.objectRepository.delete(id);
  }

  async getObjectsCount(filters?: ObjectFilters): Promise<number> {
    return this.objectRepository.count(filters);
  }

  async getObjectTasks(objectId: string): Promise<Array<{ id: string; text: string; completed: boolean }>> {
    return this.objectRepository.getObjectTasks(objectId);
  }
}
