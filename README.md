# Хакатон Backend

Backend приложение для системы управления объектами и чеклистами с использованием PostgreSQL, Prisma ORM и Express.js.

## 🚀 Технологии

- **Backend**: Node.js, Express.js, TypeScript
- **База данных**: PostgreSQL 16
- **ORM**: Prisma
- **Валидация**: Zod
- **Файловое хранилище**: MinIO
- **WebSocket**: Socket.IO (для чата)
- **Контейнеризация**: Docker, Docker Compose

## 📁 Структура проекта

```
hakaton_backend/
├── client/                 # Frontend приложение (React + Vite)
├── server/                 # Backend приложение
│   ├── src/
│   │   ├── modules/        # Модули приложения
│   │   │   ├── objects/    # Модуль объектов
│   │   │   ├── checklists/ # Модуль чеклистов
│   │   │   └── chat/       # Модуль чата
│   │   ├── infra/          # Инфраструктура
│   │   └── app.ts          # Главный файл приложения
│   ├── prisma/             # Схема и миграции Prisma
│   └── package.json
├── docker-compose.yml      # Docker Compose конфигурация
└── README.md
```

## 🛠 Установка и запуск

### Предварительные требования

- Docker и Docker Compose
- Node.js 20+ (для локальной разработки)
- npm или yarn

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd hakaton_backend
```

### 2. Запуск через Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск только базы данных и MinIO
docker-compose up -d postgres minio

# Запуск в режиме разработки (с hot reload)
docker-compose --profile dev up -d
```

### 3. Локальная разработка

#### Backend

```bash
cd server

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env

# Запуск миграций базы данных
npx prisma migrate dev

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
npm start
```

#### Frontend

```bash
cd client

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 🌐 Порты и сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| **Frontend** | 3001 | React приложение |
| **Backend** | 3000 | API сервер |
| **Backend Dev** | 3002 | API сервер (режим разработки) |
| **PostgreSQL** | 5432 | База данных (hakaton-postgres) |

| **MinIO** | 9000 | Файловое хранилище |
| **MinIO Console** | 9001 | Веб-интерфейс MinIO |

## 📊 База данных

### Схема данных

#### Objects (Объекты)
- `id` - Уникальный идентификатор
- `name` - Название объекта
- `description` - Описание
- `type` - Тип объекта (PROJECT, TASK, SUBTASK)
- `assignee` - Ответственный
- `startDate` - Дата начала
- `endDate` - Дата окончания
- `progress` - Прогресс (0-100)
- `isExpanded` - Развернут ли объект
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

#### Checklists (Чеклисты)
- `id` - Уникальный идентификатор
- `objectId` - ID связанного объекта
- `title` - Название чеклиста
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

#### ChecklistItems (Элементы чеклиста)
- `id` - Уникальный идентификатор
- `checklistId` - ID чеклиста
- `text` - Текст задачи
- `completed` - Выполнена ли задача
- `completedAt` - Дата выполнения
- `createdAt` - Дата создания

### Миграции

```bash
# Создание новой миграции
npx prisma migrate dev --name migration_name

# Применение миграций
npx prisma migrate deploy

# Сброс базы данных
npx prisma migrate reset
```

## 🔌 API Endpoints

### Объекты (`/api/objects`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/` | Получить все объекты |
| `GET` | `/:id` | Получить объект по ID |
| `POST` | `/` | Создать объект |
| `PUT` | `/:id` | Обновить объект |
| `DELETE` | `/:id` | Удалить объект |

**Пример создания объекта:**
```json
POST /api/objects
{
  "name": "Новый проект",
  "description": "Описание проекта",
  "type": "PROJECT",
  "assignee": "Иван Иванов",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.000Z",
  "progress": 0
}
```

### Чеклисты (`/api/checklists`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/` | Получить все чеклисты |
| `GET` | `/:id` | Получить чеклист по ID |
| `GET` | `/object/:objectId` | Получить чеклисты объекта |
| `POST` | `/` | Создать чеклист |
| `PUT` | `/:id` | Обновить чеклист |
| `DELETE` | `/:id` | Удалить чеклист |

**Пример создания чеклиста:**
```json
POST /api/checklists
{
  "objectId": "object_id_here",
  "title": "Основные задачи проекта"
}
```

### Элементы чеклиста (`/api/checklists/items`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/:id` | Получить элемент по ID |
| `GET` | `/checklist/:checklistId` | Получить элементы чеклиста |
| `POST` | `/` | Создать элемент |
| `PUT` | `/:id` | Обновить элемент |
| `DELETE` | `/:id` | Удалить элемент |

**Пример создания элемента:**
```json
POST /api/checklists/items
{
  "checklistId": "checklist_id_here",
  "text": "Создать техническое задание"
}
```

**Пример отметки как выполненной:**
```json
PUT /api/checklists/items/:id
{
  "completed": true
}
```

## 🔧 Переменные окружения

### Backend (.env)

```env
# База данных
DATABASE_URL="postgresql://hakaton_user:hakaton_password@localhost:5432/hakaton_db"

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=chat-files

# Сервер
PORT=3000
NODE_ENV=development
```

## 🐳 Docker

### Основные команды

```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d

# Остановка сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f [service_name]

# Пересборка конкретного сервиса
docker-compose build [service_name]
```

### Сервисы

- **postgres**: PostgreSQL база данных (hakaton-postgres)

- **minio**: MinIO файловое хранилище
- **minio-setup**: Инициализация MinIO bucket
- **frontend**: React приложение
- **backend**: API сервер (продакшен)
- **backend-dev**: API сервер (разработка)

## 🧪 Тестирование API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Создание тестового объекта
```bash
curl -X POST http://localhost:3000/api/objects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовый проект",
    "description": "Описание тестового проекта",
    "type": "PROJECT",
    "assignee": "Тестовый пользователь",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z",
    "progress": 0
  }'
```

### Получение всех объектов
```bash
curl http://localhost:3000/api/objects
```

## 📝 Разработка

### Структура модулей

Каждый модуль следует Clean Architecture принципам:

```
modules/
├── domain/           # Доменные сущности и интерфейсы
├── application/      # Use cases и бизнес-логика
├── infrastructure/   # Реализации репозиториев
└── api/             # HTTP роуты и контроллеры
```

### Добавление нового модуля

1. Создайте структуру папок в `src/modules/`
2. Определите доменные типы в `domain/types.ts`
3. Создайте интерфейс репозитория в `domain/repository.ts`
4. Реализуйте use cases в `application/use-cases.ts`
5. Создайте Prisma репозиторий в `infrastructure/`
6. Добавьте API роуты в `api/routes.ts`
7. Подключите модуль в `app.ts`

## 🚨 Устранение неполадок

### Проблемы с базой данных

```bash
# Проверка подключения к базе
docker exec hakaton_backend-postgres-1 psql -U hakaton_user -d hakaton_db -c "\l"


# Сброс миграций
npx prisma migrate reset

# Применение миграций
npx prisma migrate deploy
```

### Проблемы с портами

```bash
# Проверка занятых портов
lsof -i :3000
lsof -i :5432

# Остановка процессов
kill -9 <PID>
```

### Проблемы с Docker

```bash
# Очистка Docker
docker system prune -a

# Пересборка без кэша
docker-compose build --no-cache
```

## 📚 Дополнительные ресурсы

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)


## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.
