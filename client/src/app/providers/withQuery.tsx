import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

export const withQuery = (component: () => ReactNode) => {
  const WithQueryComponent = () => {
    // Создаем QueryClient с настройками
    const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              // Время кэширования по умолчанию
              staleTime: 5 * 60 * 1000, // 5 минут
              // Время жизни кэша
              gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
              // Повторные запросы при фокусе окна
              refetchOnWindowFocus: false,
              // Повторные запросы при переподключении
              refetchOnReconnect: true,
              // Повторные запросы при монтировании
              refetchOnMount: true,
              // Количество повторных попыток при ошибке
              retry: (failureCount, error: unknown) => {
                // Не повторяем для 4xx ошибок (кроме 408, 429)
                const axiosError = error as { response?: { status: number } };
                if (
                  axiosError?.response?.status &&
                  axiosError.response.status >= 400 &&
                  axiosError.response.status < 500
                ) {
                  if (
                    axiosError.response.status === 408 ||
                    axiosError.response.status === 429
                  ) {
                    return failureCount < 2;
                  }
                  return false;
                }
                // Повторяем для других ошибок до 3 раз
                return failureCount < 3;
              },
              // Задержка между повторными попытками
              retryDelay: attemptIndex =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            mutations: {
              // Количество повторных попыток для мутаций
              retry: (failureCount, error: unknown) => {
                // Не повторяем для 4xx ошибок
                const axiosError = error as { response?: { status: number } };
                if (
                  axiosError?.response?.status &&
                  axiosError.response.status >= 400 &&
                  axiosError.response.status < 500
                ) {
                  return false;
                }
                // Повторяем для других ошибок до 2 раз
                return failureCount < 2;
              },
              // Задержка между повторными попытками для мутаций
              retryDelay: attemptIndex =>
                Math.min(1000 * 2 ** attemptIndex, 10000),
            },
          },
        })
    );

    return (
      <QueryClientProvider client={queryClient}>
        {component()}
        {/* DevTools только в development режиме */}
        {(import.meta as { env?: { DEV?: boolean } }).env?.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    );
  };

  WithQueryComponent.displayName = 'WithQuery';

  return WithQueryComponent;
};
