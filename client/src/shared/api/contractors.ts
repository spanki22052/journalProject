import apiClient from './client';

export interface Contractor {
  id: string;
  fullName: string;
}

// API endpoints для подрядчиков
const CONTRACTORS_ENDPOINTS = {
  BASE: '/contractors',
} as const;

// Сервис для работы с подрядчиками
export const contractorsApi = {
  // Получить всех подрядчиков
  async getAll(): Promise<Contractor[]> {
    const response = await apiClient.get<Contractor[]>(CONTRACTORS_ENDPOINTS.BASE);
    return response.data;
  },
};
