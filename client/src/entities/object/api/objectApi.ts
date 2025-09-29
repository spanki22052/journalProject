import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectsApi } from '@shared/api';
import type {
  CreateObjectRequest,
  UpdateObjectRequest,
  SearchParams,
} from '@shared/api';

// Query keys для кэширования
export const objectQueryKeys = {
  all: ['objects'] as const,
  lists: () => [...objectQueryKeys.all, 'list'] as const,
  list: (params?: SearchParams) =>
    [...objectQueryKeys.lists(), params] as const,
  details: () => [...objectQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...objectQueryKeys.details(), id] as const,
} as const;

// Хуки для работы с объектами
export const useObjects = (params?: SearchParams) => {
  return useQuery({
    queryKey: objectQueryKeys.list(params),
    queryFn: () => objectsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useObject = (id: string) => {
  return useQuery({
    queryKey: objectQueryKeys.detail(id),
    queryFn: () => objectsApi.getById(id),
    enabled: !!id,
  });
};

// Мутации для объектов
export const useCreateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateObjectRequest) => objectsApi.create(data),
    onSuccess: () => {
      // Инвалидируем кэш списков объектов
      queryClient.invalidateQueries({ queryKey: objectQueryKeys.lists() });
    },
  });
};

export const useUpdateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateObjectRequest) => objectsApi.update(data),
    onSuccess: updatedObject => {
      // Обновляем кэш конкретного объекта
      queryClient.setQueryData(
        objectQueryKeys.detail(updatedObject.id),
        updatedObject
      );
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: objectQueryKeys.lists() });
    },
  });
};

export const useDeleteObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Удаляем объект из кэша
      queryClient.removeQueries({
        queryKey: objectQueryKeys.detail(deletedId),
      });
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: objectQueryKeys.lists() });
    },
  });
};
