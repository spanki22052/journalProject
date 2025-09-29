import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worksApi } from '@shared/api';
import type { CreateWorkRequest, UpdateWorkRequest } from '@shared/api';

// Query keys для кэширования
export const workQueryKeys = {
  all: ['works'] as const,
  lists: () => [...workQueryKeys.all, 'list'] as const,
  list: (objectId?: string) => [...workQueryKeys.lists(), objectId] as const,
  details: () => [...workQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...workQueryKeys.details(), id] as const,
  byObject: (objectId: string) =>
    [...workQueryKeys.all, 'byObject', objectId] as const,
} as const;

// Хуки для работы с работами
export const useWork = (id: string) => {
  return useQuery({
    queryKey: workQueryKeys.detail(id),
    queryFn: () => worksApi.getById(id),
    enabled: !!id,
  });
};

export const useWorksByObject = (objectId: string) => {
  return useQuery({
    queryKey: workQueryKeys.byObject(objectId),
    queryFn: () => worksApi.getByObjectId(objectId),
    enabled: !!objectId,
  });
};

// Мутации для работ
export const useCreateWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkRequest) => worksApi.create(data),
    onSuccess: newWork => {
      // Инвалидируем кэш работ для объекта
      queryClient.invalidateQueries({
        queryKey: workQueryKeys.byObject(newWork.objectId),
      });
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: workQueryKeys.lists() });
    },
  });
};

export const useUpdateWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkRequest) => worksApi.update(data),
    onSuccess: updatedWork => {
      // Обновляем кэш конкретной работы
      queryClient.setQueryData(
        workQueryKeys.detail(updatedWork.id),
        updatedWork
      );
      // Инвалидируем кэш работ для объекта
      queryClient.invalidateQueries({
        queryKey: workQueryKeys.byObject(updatedWork.objectId),
      });
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: workQueryKeys.lists() });
    },
  });
};

export const useDeleteWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => worksApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Удаляем работу из кэша
      queryClient.removeQueries({ queryKey: workQueryKeys.detail(deletedId) });
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: workQueryKeys.lists() });
    },
  });
};
