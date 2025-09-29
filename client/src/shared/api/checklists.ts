import apiClient from './client';
import type {
  ChecklistApi,
  CreateChecklistRequest,
  UpdateChecklistRequest,
  ChecklistItemApi,
} from './types';

// API endpoints для чеклистов
const CHECKLISTS_ENDPOINTS = {
  BASE: '/checklists',
  BY_ID: (id: string) => `/checklists/${id}`,
  BY_OBJECT_ID: (objectId: string) => `/checklists/object/${objectId}`,
  ITEMS: '/checklists/items',
  ITEM_BY_ID: (itemId: string) => `/checklists/items/${itemId}`,
  ITEMS_BY_CHECKLIST: (checklistId: string) =>
    `/checklists/items/checklist/${checklistId}`,
} as const;

// Сервис для работы с чеклистами
export const checklistsApi = {
  // Получить чеклист по ID
  async getById(id: string): Promise<ChecklistApi> {
    const response = await apiClient.get<ChecklistApi>(
      CHECKLISTS_ENDPOINTS.BY_ID(id)
    );
    return response.data;
  },

  // Получить чеклисты по ID объекта
  async getByObjectId(objectId: string): Promise<ChecklistApi[]> {
    const response = await apiClient.get<ChecklistApi[]>(
      CHECKLISTS_ENDPOINTS.BY_OBJECT_ID(objectId)
    );
    return response.data;
  },

  // Создать новый чеклист
  async create(data: CreateChecklistRequest): Promise<ChecklistApi> {
    const response = await apiClient.post<ChecklistApi>(
      CHECKLISTS_ENDPOINTS.BASE,
      data
    );
    return response.data;
  },

  // Обновить чеклист
  async update(data: UpdateChecklistRequest): Promise<ChecklistApi> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<ChecklistApi>(
      CHECKLISTS_ENDPOINTS.BY_ID(id),
      updateData
    );
    return response.data;
  },

  // Удалить чеклист
  async delete(id: string): Promise<void> {
    await apiClient.delete(CHECKLISTS_ENDPOINTS.BY_ID(id));
  },

  // Работа с элементами чеклиста
  items: {
    // Получить элемент чеклиста по ID
    async getById(itemId: string): Promise<ChecklistItemApi> {
      const response = await apiClient.get<ChecklistItemApi>(
        CHECKLISTS_ENDPOINTS.ITEM_BY_ID(itemId)
      );
      return response.data;
    },

    // Получить элементы чеклиста по ID чеклиста
    async getByChecklistId(checklistId: string): Promise<ChecklistItemApi[]> {
      const response = await apiClient.get<ChecklistItemApi[]>(
        CHECKLISTS_ENDPOINTS.ITEMS_BY_CHECKLIST(checklistId)
      );
      return response.data;
    },

    // Создать новый элемент чеклиста
    async create(
      data: Omit<ChecklistItemApi, 'id' | 'createdAt' | 'completedAt'>
    ): Promise<ChecklistItemApi> {
      const response = await apiClient.post<ChecklistItemApi>(
        CHECKLISTS_ENDPOINTS.ITEMS,
        data
      );
      return response.data;
    },

    // Обновить элемент чеклиста
    async update(
      itemId: string,
      data: Partial<Omit<ChecklistItemApi, 'id' | 'createdAt'>>
    ): Promise<ChecklistItemApi> {
      const response = await apiClient.put<ChecklistItemApi>(
        CHECKLISTS_ENDPOINTS.ITEM_BY_ID(itemId),
        data
      );
      return response.data;
    },

    // Удалить элемент чеклиста
    async delete(itemId: string): Promise<void> {
      await apiClient.delete(CHECKLISTS_ENDPOINTS.ITEM_BY_ID(itemId));
    },
  },
};
