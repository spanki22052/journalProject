import type {
  ObjectData,
  CreateObjectData,
  UpdateObjectData,
  ObjectFilters,
} from "./types.js";

export interface ObjectRepository {
  create(data: CreateObjectData): Promise<ObjectData>;
  findById(id: string): Promise<ObjectData | null>;
  findAll(filters?: ObjectFilters): Promise<ObjectData[]>;
  update(id: string, data: UpdateObjectData): Promise<ObjectData | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: ObjectFilters): Promise<number>;
}
