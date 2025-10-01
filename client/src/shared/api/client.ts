const API_BASE_URL = 'http://localhost:3003/api';

export interface CreateObjectData {
  name: string;
  assignee: string;
  description?: string;
  startDate: string;
  endDate: string;
  polygonCoords?: number[][];
}

export interface ObjectData {
  id: string;
  name: string;
  description?: string;
  type: 'PROJECT' | 'TASK' | 'SUBTASK';
  assignee: string;
  startDate: string;
  endDate: string;
  progress: number;
  isExpanded: boolean;
  polygon?: string;
  polygonCoords?: number[][];
  createdAt: string;
  updatedAt: string;
}

export interface ObjectsResponse {
  data: ObjectData[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface ObjectFilters {
  type?: 'PROJECT' | 'TASK' | 'SUBTASK';
  assignee?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async createObject(data: CreateObjectData): Promise<ObjectData> {
    console.log('Sending request to create object:', data);

    const response = await fetch(`${API_BASE_URL}/objects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'Failed to create object',
        response.status,
        errorData.details
      );
    }

    const result = await response.json();
    console.log('Object created successfully:', result);
    return result;
  },

  async getObjects(filters?: ObjectFilters): Promise<ObjectsResponse> {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.assignee) params.append('assignee', filters.assignee);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/objects${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'Failed to fetch objects',
        response.status,
        errorData.details
      );
    }

    return response.json();
  },

  async getObjectById(id: string): Promise<ObjectData> {
    const response = await fetch(`${API_BASE_URL}/objects/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'Failed to fetch object',
        response.status,
        errorData.details
      );
    }

    return response.json();
  },

  async updateObject(
    id: string,
    data: Partial<CreateObjectData>
  ): Promise<ObjectData> {
    const response = await fetch(`${API_BASE_URL}/objects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'Failed to update object',
        response.status,
        errorData.details
      );
    }

    return response.json();
  },

  async deleteObject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/objects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'Failed to delete object',
        response.status,
        errorData.details
      );
    }
  },
};

export { ApiError };
