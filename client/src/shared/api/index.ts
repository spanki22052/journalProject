// Экспорт API клиента
export { default as apiClient } from './client';

// Экспорт типов
export * from './types';

// Экспорт API сервисов
export { objectsApi } from './objects';
export { checklistsApi } from './checklists';
export { worksApi } from './works';

// Экспорт моковых данных (для совместимости)
export * from './mockData';
