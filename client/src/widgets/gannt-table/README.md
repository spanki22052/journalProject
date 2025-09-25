# Кастомный TaskListHeader для gantt-task-react

Этот компонент позволяет заменить дефолтные заголовки колонок (name, from, to) в библиотеке gantt-task-react на кастомные русские названия.

## Доступные типы заголовков

### 1. CustomTaskListHeader (по умолчанию)

Полный кастомный заголовок с русскими названиями колонок:

- Название работы
- Исполнитель
- Прогресс
- Начало
- Окончание

### 2. EmptyTaskListHeader

Полностью скрывает заголовок

### 3. MinimalTaskListHeader

Минимальный заголовок с одним названием "Задачи"

### 4. Default

Использует стандартный заголовок библиотеки

## Использование

```tsx
import { GanntTable } from './GanntTable';

// Кастомный заголовок (по умолчанию)
<GanntTable
  selectedOrganization="org1"
  selectedWorks={["work1", "work2"]}
  headerType="custom"
/>

// Скрыть заголовок
<GanntTable
  selectedOrganization="org1"
  selectedWorks={["work1", "work2"]}
  headerType="empty"
/>

// Минимальный заголовок
<GanntTable
  selectedOrganization="org1"
  selectedWorks={["work1", "work2"]}
  headerType="minimal"
/>

// Стандартный заголовок
<GanntTable
  selectedOrganization="org1"
  selectedWorks={["work1", "work2"]}
  headerType="default"
/>
```

## Структура файлов

- `CustomTaskListHeader.tsx` - компоненты кастомных заголовков
- `GanntTable.tsx` - основной компонент диаграммы Ганта с поддержкой кастомных заголовков
- `GanntTable.module.css` - стили для заголовков
