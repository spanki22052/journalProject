# Настройка алиасов FSD в Object Journal

## ✅ Что настроено

### 1. Webpack алиасы (`webpack.config.js`)

```javascript
alias: {
  '@app': path.resolve(__dirname, 'src/app'),
  '@pages': path.resolve(__dirname, 'src/pages'),
  '@widgets': path.resolve(__dirname, 'src/widgets'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@entities': path.resolve(__dirname, 'src/entities'),
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@': path.resolve(__dirname, 'src'),
  '@public': path.resolve(__dirname, 'public'),
}
```

### 2. TypeScript пути (`tsconfig.json`)

```json
{
  "baseUrl": ".",
  "paths": {
    "@app/*": ["src/app/*"],
    "@pages/*": ["src/pages/*"],
    "@widgets/*": ["src/widgets/*"],
    "@features/*": ["src/features/*"],
    "@entities/*": ["src/entities/*"],
    "@shared/*": ["src/shared/*"],
    "@/*": ["src/*"],
    "@public/*": ["public/*"]
  }
}
```

### 3. VS Code настройки (`.vscode/settings.json`)

- Автодополнение для алиасов
- IntelliSense для путей

## 🚀 Как использовать

### Импорты между слоями

```typescript
// ✅ Правильно - используйте алиасы
import { MainPage } from '@pages/main';
import { Navigation } from '@widgets/navigation/Navigation';
import { FiltersModal } from '@features/filters-modal/FiltersModal';
import { useServiceWorker } from '@shared/lib/useServiceWorker';

// ❌ Неправильно - не используйте относительные пути
import { MainPage } from '../pages/main';
import { Navigation } from '../../../widgets/navigation/Navigation';
```

### Импорты внутри слоя

```typescript
// ✅ Можно использовать относительные пути
import { useMainPage } from '../hooks/useMainPage';
import { MainPageState } from '../model/types';

// ✅ Или алиасы
import { useMainPage } from '@pages/main/hooks/useMainPage';
```

## 📁 Структура слоев

```
src/
├── app/          # @app/*     - Инициализация приложения
├── pages/        # @pages/*   - Страницы приложения
├── widgets/      # @widgets/* - Крупные UI блоки
├── features/     # @features/* - Функциональности
├── entities/     # @entities/* - Бизнес-сущности
└── shared/       # @shared/*  - Переиспользуемые ресурсы
```

## 🔄 Обновленные файлы

- `webpack.config.js` - добавлены алиасы
- `tsconfig.json` - добавлены пути TypeScript
- `.eslintrc.js` - настройки для понимания алиасов
- `.vscode/settings.json` - настройки VS Code
- `src/app/App.tsx` - обновлены импорты
- `src/pages/main/ui/MainPage.tsx` - обновлены импорты
- `src/features/filters-modal/FiltersModal.tsx` - обновлены импорты
- `src/features/organization-selector/OrganizationSelector.tsx` - обновлены импорты
- `src/features/work-selector/WorkSelector.tsx` - обновлены импорты

## ✨ Преимущества

1. **Читаемость** - сразу понятно, из какого слоя импорт
2. **Рефакторинг** - легко перемещать файлы
3. **Автодополнение** - IDE лучше понимает структуру
4. **Консистентность** - единообразные импорты
5. **Масштабируемость** - легко добавлять новые модули

## 🧪 Проверка работы

```bash
# Сборка проекта
npm run build

# Проверка линтера
npm run lint:check

# Запуск в режиме разработки
npm run start
```

Все алиасы настроены и работают! 🎉
