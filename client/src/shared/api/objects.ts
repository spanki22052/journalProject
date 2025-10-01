import apiClient from './client';
import type {
  ObjectApi,
  CreateObjectRequest,
  UpdateObjectRequest,
  SearchParams,
} from './types';

// API endpoints для объектов
const OBJECTS_ENDPOINTS = {
  BASE: '/objects',
  BY_ID: (id: string) => `/objects/${id}`,
} as const;

// Сервис для работы с объектами
export const objectsApi = {
  // Получить все объекты
  async getAll(params?: SearchParams): Promise<{
    data: ObjectApi[];
    total: number;
    limit?: number;
    offset?: number;
  }> {
    const response = await apiClient.get<{
      data: ObjectApi[];
      total: number;
      limit?: number;
      offset?: number;
    }>(OBJECTS_ENDPOINTS.BASE, { params });
    return response.data;
  },

  // Получить объект по ID
  async getById(id: string): Promise<ObjectApi> {
    const response = await apiClient.get<ObjectApi>(
      OBJECTS_ENDPOINTS.BY_ID(id)
    );
    return response.data;
  },

  // Создать новый объект
  async create(data: CreateObjectRequest): Promise<ObjectApi> {
    const response = await apiClient.post<ObjectApi>(
      OBJECTS_ENDPOINTS.BASE,
      data
    );
    return response.data;
  },

  // Обновить объект
  async update(data: UpdateObjectRequest): Promise<ObjectApi> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<ObjectApi>(
      OBJECTS_ENDPOINTS.BY_ID(id),
      updateData
    );
    return response.data;
  },

  // Удалить объект
  async delete(id: string): Promise<void> {
    await apiClient.delete(OBJECTS_ENDPOINTS.BY_ID(id));
  },
};
