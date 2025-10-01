import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// Конфигурация API
const API_BASE_URL =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT =
  Number(
    (import.meta as { env?: { VITE_API_TIMEOUT?: string } }).env
      ?.VITE_API_TIMEOUT
  ) || 10000;

// Создаем экземпляр axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для запросов
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Добавляем токен авторизации если есть
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Интерсептор для ответов
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Логируем ответ в development режиме

    return response;
  },
  (error: AxiosError) => {
    // Обработка ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response;

      console.error(`❌ API Error ${status}:`, data);

      switch (status) {
        case 401:
          // Неавторизован - очищаем токен и перенаправляем на логин
          localStorage.removeItem('authToken');
          // Можно добавить перенаправление на страницу логина
          break;
        case 403:
          // Доступ запрещен
          console.error('Доступ запрещен');
          break;
        case 404:
          // Ресурс не найден
          console.error('Ресурс не найден');
          break;
        case 500:
          // Внутренняя ошибка сервера
          console.error('Внутренняя ошибка сервера');
          break;
        default:
          console.error(`Ошибка API: ${status}`);
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      console.error('❌ Network Error:', error.message);
    } else {
      // Что-то пошло не так при настройке запроса
      console.error('❌ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
