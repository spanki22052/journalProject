import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '@shared/api';
import type {
  CreateChecklistRequest,
  UpdateChecklistRequest,
  ChecklistItemApi,
} from '@shared/api';

// Query keys для кэширования
export const checklistQueryKeys = {
  all: ['checklists'] as const,
  lists: () => [...checklistQueryKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...checklistQueryKeys.lists(), params] as const,
  details: () => [...checklistQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistQueryKeys.details(), id] as const,
  byObject: (objectId: string) =>
    [...checklistQueryKeys.all, 'byObject', objectId] as const,
  items: (checklistId: string) =>
    [...checklistQueryKeys.all, 'items', checklistId] as const,
} as const;

// Хуки для работы с чеклистами

export const useChecklist = (id: string) => {
  return useQuery({
    queryKey: checklistQueryKeys.detail(id),
    queryFn: () => checklistsApi.getById(id),
    enabled: !!id,
  });
};

export const useChecklistsByObject = (objectId: string) => {
  return useQuery({
    queryKey: checklistQueryKeys.byObject(objectId),
    queryFn: () => checklistsApi.getByObjectId(objectId),
    enabled: !!objectId,
  });
};

// Мутации для чеклистов
export const useCreateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChecklistRequest) => checklistsApi.create(data),
    onSuccess: newChecklist => {
      // Инвалидируем кэш списков чеклистов
      queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() });
      // Инвалидируем кэш чеклистов для конкретного объекта
      queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.byObject(newChecklist.objectId),
      });
    },
  });
};

export const useUpdateChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChecklistRequest) => checklistsApi.update(data),
    onSuccess: updatedChecklist => {
      // Обновляем кэш конкретного чеклиста
      queryClient.setQueryData(
        checklistQueryKeys.detail(updatedChecklist.id),
        updatedChecklist
      );
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() });
    },
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Удаляем чеклист из кэша
      queryClient.removeQueries({
        queryKey: checklistQueryKeys.detail(deletedId),
      });
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: checklistQueryKeys.lists() });
    },
  });
};

// Хуки для работы с элементами чеклиста
export const useChecklistItems = (checklistId: string) => {
  return useQuery({
    queryKey: checklistQueryKeys.items(checklistId),
    queryFn: () => checklistsApi.items.getByChecklistId(checklistId),
    enabled: !!checklistId,
  });
};

export const useCreateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<ChecklistItemApi, 'id' | 'createdAt' | 'completedAt'>
    ) => checklistsApi.items.create(data),
    onSuccess: newItem => {
      // Инвалидируем кэш элементов чеклиста
      queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.items(newItem.checklistId),
      });
      // Инвалидируем кэш самого чеклиста
      queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.detail(newItem.checklistId),
      });
    },
  });
};

export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: Partial<Omit<ChecklistItemApi, 'id' | 'createdAt'>>;
    }) => checklistsApi.items.update(itemId, data),
    onSuccess: updatedItem => {
      // Инвалидируем кэш элементов чеклиста
      queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.items(updatedItem.checklistId),
      });
      // Инвалидируем кэш самого чеклиста
      queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.detail(updatedItem.checklistId),
      });
    },
  });
};

export const useDeleteChecklistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => checklistsApi.items.delete(itemId),
    onSuccess: () => {
      // Инвалидируем все кэши элементов чеклистов
      queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.all,
      });
    },
  });
};
