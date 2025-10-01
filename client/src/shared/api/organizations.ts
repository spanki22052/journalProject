import apiClient from './client';
import type {
  OrganizationApi,
  WorkApi,
  ApiResponse,
  PaginatedResponse,
} from './types';

// API endpoints для организаций
const ORGANIZATIONS_ENDPOINTS = {
  BASE: '/organizations',
  BY_ID: (id: string) => `/organizations/${id}`,
  WORKS: (id: string) => `/organizations/${id}/works`,
  WORK_BY_ID: (orgId: string, workId: string) =>
    `/organizations/${orgId}/works/${workId}`,
} as const;

// Сервис для работы с организациями
export const organizationsApi = {
  // Получить все организации
  async getAll(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<OrganizationApi>> {
    const response = await apiClient.get<PaginatedResponse<OrganizationApi>>(
      ORGANIZATIONS_ENDPOINTS.BASE,
      { params }
    );
    return response.data;
  },

  // Получить организацию по ID
  async getById(id: string): Promise<OrganizationApi> {
    const response = await apiClient.get<ApiResponse<OrganizationApi>>(
      ORGANIZATIONS_ENDPOINTS.BY_ID(id)
    );
    return response.data.data;
  },

  // Создать новую организацию
  async create(data: { name: string }): Promise<OrganizationApi> {
    const response = await apiClient.post<ApiResponse<OrganizationApi>>(
      ORGANIZATIONS_ENDPOINTS.BASE,
      data
    );
    return response.data.data;
  },

  // Обновить организацию
  async update(id: string, data: { name: string }): Promise<OrganizationApi> {
    const response = await apiClient.put<ApiResponse<OrganizationApi>>(
      ORGANIZATIONS_ENDPOINTS.BY_ID(id),
      data
    );
    return response.data.data;
  },

  // Удалить организацию
  async delete(id: string): Promise<void> {
    await apiClient.delete(ORGANIZATIONS_ENDPOINTS.BY_ID(id));
  },

  // Работа с работами организации
  works: {
    // Получить все работы организации
    async getAll(organizationId: string): Promise<WorkApi[]> {
      const response = await apiClient.get<ApiResponse<WorkApi[]>>(
        ORGANIZATIONS_ENDPOINTS.WORKS(organizationId)
      );
      return response.data.data;
    },

    // Получить работу по ID
    async getById(organizationId: string, workId: string): Promise<WorkApi> {
      const response = await apiClient.get<ApiResponse<WorkApi>>(
        ORGANIZATIONS_ENDPOINTS.WORK_BY_ID(organizationId, workId)
      );
      return response.data.data;
    },

    // Создать новую работу
    async create(
      organizationId: string,
      data: Omit<WorkApi, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<WorkApi> {
      const response = await apiClient.post<ApiResponse<WorkApi>>(
        ORGANIZATIONS_ENDPOINTS.WORKS(organizationId),
        data
      );
      return response.data.data;
    },

    // Обновить работу
    async update(
      organizationId: string,
      workId: string,
      data: Partial<Omit<WorkApi, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<WorkApi> {
      const response = await apiClient.put<ApiResponse<WorkApi>>(
        ORGANIZATIONS_ENDPOINTS.WORK_BY_ID(organizationId, workId),
        data
      );
      return response.data.data;
    },

    // Удалить работу
    async delete(organizationId: string, workId: string): Promise<void> {
      await apiClient.delete(
        ORGANIZATIONS_ENDPOINTS.WORK_BY_ID(organizationId, workId)
      );
    },

    // Обновить прогресс работы
    async updateProgress(
      organizationId: string,
      workId: string,
      progress: number
    ): Promise<WorkApi> {
      const response = await apiClient.patch<ApiResponse<WorkApi>>(
        `${ORGANIZATIONS_ENDPOINTS.WORK_BY_ID(organizationId, workId)}/progress`,
        { progress }
      );
      return response.data.data;
    },
  },
};
