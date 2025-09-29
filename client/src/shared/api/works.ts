import apiClient from './client';
import type { WorkApi, CreateWorkRequest, UpdateWorkRequest } from './types';

// API endpoints для работ
const WORKS_ENDPOINTS = {
  BASE: '/works',
  BY_ID: (id: string) => `/works/${id}`,
  BY_OBJECT_ID: (objectId: string) => `/works/object/${objectId}`,
} as const;

// Сервис для работы с работами
export const worksApi = {
  // Получить работу по ID
  async getById(id: string): Promise<WorkApi> {
    const response = await apiClient.get<WorkApi>(WORKS_ENDPOINTS.BY_ID(id));
    return response.data;
  },

  // Получить работы по ID объекта
  async getByObjectId(objectId: string): Promise<WorkApi[]> {
    const response = await apiClient.get<WorkApi[]>(
      WORKS_ENDPOINTS.BY_OBJECT_ID(objectId)
    );
    return response.data;
  },

  // Создать новую работу
  async create(data: CreateWorkRequest): Promise<WorkApi> {
    const response = await apiClient.post<WorkApi>(WORKS_ENDPOINTS.BASE, data);
    return response.data;
  },

  // Обновить работу
  async update(data: UpdateWorkRequest): Promise<WorkApi> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<WorkApi>(
      WORKS_ENDPOINTS.BY_ID(id),
      updateData
    );
    return response.data;
  },

  // Удалить работу
  async delete(id: string): Promise<void> {
    await apiClient.delete(WORKS_ENDPOINTS.BY_ID(id));
  },
};
