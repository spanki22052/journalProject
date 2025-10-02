import { useQuery } from '@tanstack/react-query';
import { contractorsApi, type Contractor } from '@shared/api';

// Query keys для кэширования
export const contractorQueryKeys = {
  all: ['contractors'] as const,
  lists: () => [...contractorQueryKeys.all, 'list'] as const,
  list: () => [...contractorQueryKeys.lists()] as const,
} as const;

// Хуки для работы с подрядчиками
export const useContractors = () => {
  return useQuery({
    queryKey: contractorQueryKeys.list(),
    queryFn: () => contractorsApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};
