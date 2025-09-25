# Примеры использования алиасов FSD

## Настроенные алиасы

```typescript
// В webpack.config.js и tsconfig.json настроены следующие алиасы:
'@app/*'     -> 'src/app/*'
'@pages/*'   -> 'src/pages/*'
'@widgets/*' -> 'src/widgets/*'
'@features/*' -> 'src/features/*'
'@entities/*' -> 'src/entities/*'
'@shared/*'  -> 'src/shared/*'
'@/*'        -> 'src/*'
'@public/*'  -> 'public/*'
```

## Примеры импортов

### ✅ Правильные импорты (используя алиасы)

```typescript
// Импорт из pages
import { MainPage } from '@pages/main';

// Импорт из widgets
import { Navigation } from '@widgets/navigation/Navigation';
import { GanntTable } from '@widgets/gannt-table';

// Импорт из features
import { FiltersModal } from '@features/filters-modal/FiltersModal';
import { OrganizationSelector } from '@features/organization-selector/OrganizationSelector';
import { WorkSelector } from '@features/work-selector/WorkSelector';

// Импорт из shared
import { useServiceWorker } from '@shared/lib/useServiceWorker';
import { mockOrganizations } from '@shared/api/mockData';

// Импорт из app
import { withRouter, withAntd } from '@app/providers';

// Импорт из entities (когда будут созданы)
import { Organization } from '@entities/organization';
import { Work } from '@entities/work';

// Импорт из public
import iconUrl from '@public/icons/icon-192x192.png';
```

### ❌ Неправильные импорты (относительные пути)

```typescript
// Не используйте относительные пути для импорта между слоями
import { MainPage } from '../pages/main'; // ❌
import { Navigation } from '../../../widgets/navigation/Navigation'; // ❌
import { mockOrganizations } from '../../shared/api/mockData'; // ❌
```

### ✅ Правильные относительные импорты (внутри одного слоя)

```typescript
// Внутри features можно использовать относительные пути
import { OrganizationSelector } from '../organization-selector/OrganizationSelector'; // ✅

// Внутри pages можно использовать относительные пути
import { useMainPage } from '../hooks/useMainPage'; // ✅
import { MainPageState } from '../model/types'; // ✅
```

## Правила FSD для импортов

### 1. Импорты между слоями

- **Всегда используйте алиасы** для импортов между разными слоями
- **Никогда не используйте относительные пути** для импортов между слоями

### 2. Импорты внутри слоя

- **Можно использовать относительные пути** для импортов внутри одного слоя
- **Можно использовать алиасы** для импортов внутри одного слоя

### 3. Импорты из внешних библиотек

- **Используйте обычные импорты** для библиотек (react, antd, etc.)

## Структура слоев FSD

```
src/
├── app/          # Инициализация приложения, провайдеры
├── pages/        # Страницы приложения
├── widgets/      # Крупные UI блоки
├── features/     # Функциональности приложения
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемые ресурсы
```

## Направления импортов

### ✅ Разрешенные направления:

- `app` → `pages`, `widgets`, `features`, `entities`, `shared`
- `pages` → `widgets`, `features`, `entities`, `shared`
- `widgets` → `features`, `entities`, `shared`
- `features` → `entities`, `shared`
- `entities` → `shared`

### ❌ Запрещенные направления:

- `shared` → любой другой слой
- `entities` → `features`, `widgets`, `pages`, `app`
- `features` → `widgets`, `pages`, `app`
- `widgets` → `pages`, `app`
- `pages` → `app`

## Примеры файлов с обновленными импортами

### App.tsx

```typescript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from '@pages/main';
import { withRouter, withAntd } from './providers';
import { useServiceWorker } from '@shared/lib/useServiceWorker';
import '../App.css';
```

### MainPage.tsx

```typescript
import React from 'react';
import { Layout } from 'antd';
import { Navigation } from '@widgets/navigation/Navigation';
import { GanntTable } from '@widgets/gannt-table';
import { FiltersModal } from '@features/filters-modal/FiltersModal';
import { useMainPage } from '../hooks/useMainPage';
import styles from './MainPage.module.css';
```

### FiltersModal.tsx

```typescript
import React from 'react';
import { Modal, Space } from 'antd';
import { OrganizationSelector } from '@features/organization-selector/OrganizationSelector';
import { WorkSelector } from '@features/work-selector/WorkSelector';
```

## Преимущества использования алиасов

1. **Читаемость** - сразу понятно, из какого слоя импортируется модуль
2. **Рефакторинг** - легко перемещать файлы внутри слоя
3. **Масштабируемость** - легко добавлять новые модули
4. **Консистентность** - единообразные импорты по всему проекту
5. **Автодополнение** - IDE лучше понимает структуру проекта
