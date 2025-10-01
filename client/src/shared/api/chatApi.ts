import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  author: string;
  taskId?: string;
  isEditSuggestion: boolean;
  isCompletionConfirmation: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface Chat {
  id: string;
  objectId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatListItem {
  id: string;
  objectId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  objectName: string;
  unreadCount: number;
}

export interface CreateMessageData {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  author: string;
  taskId?: string;
  isEditSuggestion?: boolean;
  isCompletionConfirmation?: boolean;
}

export interface EditSuggestionData {
  content: string;
  author: string;
  taskId: string;
}

export interface CompletionConfirmationData {
  content: string;
  author: string;
  taskId?: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ObjectTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface FileUploadResponse {
  objectName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Получить все чаты
export const useAllChats = () => {
  return useQuery({
    queryKey: ['chats', 'all'],
    queryFn: async (): Promise<ChatListItem[]> => {
      const response = await fetch(`${API_BASE_URL}/chats`);
      if (!response.ok) {
        throw new Error('Ошибка при получении чатов');
      }
      return response.json();
    },
  });
};

// Загрузить файл
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<FileUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/chats/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла');
      }

      return response.json();
    },
  });
};

// Получить чат по ID объекта
export const useChatByObjectId = (objectId: string) => {
  return useQuery({
    queryKey: ['chat', 'object', objectId],
    queryFn: async (): Promise<Chat> => {
      const response = await fetch(`${API_BASE_URL}/chats/object/${objectId}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении чата');
      }
      return response.json();
    },
    enabled: !!objectId,
  });
};

// Получить задачи объекта
export const useObjectTasks = (objectId: string) => {
  return useQuery({
    queryKey: ['object', 'tasks', objectId],
    queryFn: async (): Promise<ObjectTask[]> => {
      const response = await fetch(`${API_BASE_URL}/objects/${objectId}/tasks`);
      if (!response.ok) {
        throw new Error('Ошибка при получении задач объекта');
      }
      return response.json();
    },
    enabled: !!objectId,
  });
};

// Создать сообщение
export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      data,
    }: {
      chatId: string;
      data: CreateMessageData;
    }): Promise<ChatMessage> => {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании сообщения');
      }

      return response.json();
    },
    onSuccess: (_, { chatId }) => {
      // Инвалидируем кэш чата и списка чатов
      queryClient.invalidateQueries({ queryKey: ['chat', 'object'] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'all'] });
    },
  });
};

// Предложить правку
export const useSuggestEdit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      data,
    }: {
      chatId: string;
      data: EditSuggestionData;
    }): Promise<ChatMessage> => {
      const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}/suggest-edit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при создании предложения правки');
      }

      return response.json();
    },
    onSuccess: (_, { chatId }) => {
      // Инвалидируем кэш чата и списка чатов
      queryClient.invalidateQueries({ queryKey: ['chat', 'object'] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'all'] });
    },
  });
};

// Подтвердить выполнение
export const useConfirmCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      data,
    }: {
      chatId: string;
      data: CompletionConfirmationData;
    }): Promise<ChatMessage> => {
      const response = await fetch(
        `${API_BASE_URL}/chats/${chatId}/confirm-completion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при подтверждении выполнения');
      }

      return response.json();
    },
    onSuccess: (_, { chatId }) => {
      // Инвалидируем кэш чата и списка чатов
      queryClient.invalidateQueries({ queryKey: ['chat', 'object'] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'all'] });
    },
  });
};
