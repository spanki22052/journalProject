# Настройка API с TanStack Query

## ✅ Что настроено

### 1. Установленные зависимости

- `@tanstack/react-query` - основная библиотека для управления состоянием сервера
- `@tanstack/react-query-devtools` - инструменты разработчика
- `axios` - HTTP клиент

### 2. API клиент (`src/shared/api/client.ts`)

- Настроенный axios с базовым URL
- Интерсепторы для запросов и ответов
- Автоматическое добавление токенов авторизации
- Обработка ошибок
- Логирование в development режиме

### 3. Типы API (`src/shared/api/types.ts`)

- Базовые типы для API ответов
- Типы для объектов, чеклистов, организаций
- Типы для пагинации и фильтрации

### 4. API сервисы

- `objectsApi` - работа с объектами
- `checklistsApi` - работа с чеклистами
- `organizationsApi` - работа с организациями

### 5. TanStack Query провайдер (`src/app/providers/withQuery.tsx`)

- Настроенный QueryClient с оптимальными настройками
- DevTools для отладки
- Настройки кэширования и повторных запросов

### 6. Entities с API хуками

- `@entities/object` - хуки для работы с объектами
- `@entities/checklist` - хуки для работы с чеклистами
- `@entities/organization` - хуки для работы с организациями

## 🚀 Как использовать

### 1. Настройка переменных окружения

Создайте файл `.env.local` в корне клиентской части:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000

# Development
VITE_NODE_ENV=development
```

### 2. Использование в компонентах

```typescript
import { useObjects, useCreateObject, useUpdateObject } from '@entities/object';
import { useChecklistsByObject } from '@entities/checklist';

function ObjectsPage() {
  // Получение списка объектов
  const { data: objects, isLoading, error } = useObjects({
    page: 1,
    limit: 10,
  });

  // Создание объекта
  const createObject = useCreateObject();

  // Обновление объекта
  const updateObject = useUpdateObject();

  const handleCreateObject = async () => {
    try {
      await createObject.mutateAsync({
        name: 'Новый объект',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        type: 'project',
        assignee: 'Иванов И.И.',
      });
    } catch (error) {
      console.error('Ошибка создания объекта:', error);
    }
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div>
      {objects?.data.map(object => (
        <div key={object.id}>{object.name}</div>
      ))}
    </div>
  );
}
```

### 3. Доступные хуки

#### Объекты (`@entities/object`)

- `useObjects(params?)` - получить список объектов
- `useObject(id)` - получить объект по ID
- `useObjectsByParent(parentId)` - получить объекты по родительскому ID
- `useCreateObject()` - создать объект
- `useUpdateObject()` - обновить объект
- `useDeleteObject()` - удалить объект
- `useUpdateObjectProgress()` - обновить прогресс
- `useToggleObjectExpanded()` - переключить раскрытие

#### Чеклисты (`@entities/checklist`)

- `useChecklists(params?)` - получить список чеклистов
- `useChecklist(id)` - получить чеклист по ID
- `useChecklistsByObject(objectId)` - получить чеклисты объекта
- `useCreateChecklist()` - создать чеклист
- `useUpdateChecklist()` - обновить чеклист
- `useDeleteChecklist()` - удалить чеклист
- `useChecklistItems(checklistId)` - получить элементы чеклиста
- `useCreateChecklistItem()` - создать элемент чеклиста
- `useUpdateChecklistItem()` - обновить элемент чеклиста
- `useDeleteChecklistItem()` - удалить элемент чеклиста
- `useToggleChecklistItem()` - переключить выполнение элемента

#### Организации (`@entities/organization`)

- `useOrganizations(params?)` - получить список организаций
- `useOrganization(id)` - получить организацию по ID
- `useCreateOrganization()` - создать организацию
- `useUpdateOrganization()` - обновить организацию
- `useDeleteOrganization()` - удалить организацию
- `useOrganizationWorks(organizationId)` - получить работы организации
- `useOrganizationWork(organizationId, workId)` - получить работу по ID
- `useCreateOrganizationWork()` - создать работу
- `useUpdateOrganizationWork()` - обновить работу
- `useDeleteOrganizationWork()` - удалить работу
- `useUpdateOrganizationWorkProgress()` - обновить прогресс работы

## 🔧 Настройки

### QueryClient настройки

- `staleTime: 5 минут` - данные считаются свежими 5 минут
- `gcTime: 10 минут` - данные хранятся в кэше 10 минут
- `refetchOnWindowFocus: false` - не обновлять при фокусе окна
- `retry: 3 попытки` - повторять запросы при ошибках

### Axios настройки

- Базовый URL: `http://localhost:3001/api`
- Таймаут: 10 секунд
- Автоматическое добавление токенов авторизации
- Обработка ошибок 401, 403, 404, 500

## 🐛 Отладка

### DevTools

В development режиме доступны React Query DevTools для отладки:

- Просмотр кэша
- Мониторинг запросов
- Управление состоянием

### Логирование

В development режиме все запросы и ответы логируются в консоль:

- 🚀 API Request - исходящие запросы
- ✅ API Response - успешные ответы
- ❌ API Error - ошибки

## 📝 Следующие шаги

1. Создайте `.env.local` файл с настройками API
2. Запустите бэкенд сервер
3. Начните использовать хуки в компонентах
4. Настройте авторизацию (добавьте токены в localStorage)
5. Добавьте обработку ошибок в UI

## 🔗 Полезные ссылки

- [TanStack Query документация](https://tanstack.com/query/latest)
- [Axios документация](https://axios-http.com/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
