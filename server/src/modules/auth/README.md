# Auth Module

Модуль аутентификации и управления ролями пользователей.

## Структура

```
src/modules/auth/
├── domain/
│   ├── types.ts          # Типы данных
│   └── repository.ts     # Интерфейсы репозиториев
├── application/
│   └── use-cases.ts      # Бизнес-логика
├── infrastructure/
│   ├── prisma-role-repository.ts      # Репозиторий ролей
│   ├── prisma-user-repository.ts      # Репозиторий пользователей
│   └── bcrypt-auth-repository.ts      # Репозиторий аутентификации
├── api/
│   └── routes.ts         # API роуты
└── index.ts              # Экспорт модуля
```

## API Endpoints

### Роли

- `POST /api/auth/roles` - Создать роль
- `GET /api/auth/roles` - Получить все роли
- `GET /api/auth/roles/:id` - Получить роль по ID
- `PUT /api/auth/roles/:id` - Обновить роль
- `DELETE /api/auth/roles/:id` - Удалить роль

### Пользователи

- `POST /api/auth/users` - Создать пользователя
- `GET /api/auth/users` - Получить всех пользователей
- `GET /api/auth/users/:id` - Получить пользователя по ID
- `PUT /api/auth/users/:id` - Обновить пользователя
- `DELETE /api/auth/users/:id` - Удалить пользователя

### Аутентификация

- `POST /api/auth/login` - Вход в систему

### Защищенные API

- `POST /api/auth/create-admin` - Создать администратора (требует X-System-Key)
- `POST /api/auth/create-organ-control` - Создать пользователя госоргана (требует X-Admin-Key)

## Примеры использования

### Создание роли

```bash
curl -X POST http://localhost:3003/api/auth/roles \
  -H "Content-Type: application/json" \
  -d '{"name": "admin"}'
```

### Создание пользователя

```bash
curl -X POST http://localhost:3003/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "fullName": "Администратор",
    "roleId": "role-uuid"
  }'
```

### Вход в систему

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Создание администратора

```bash
curl -X POST http://localhost:3003/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -H "X-System-Key: your-system-secret-key" \
  -d '{
    "email": "admin@system.local",
    "password": "Admin123!",
    "fullName": "Системный администратор"
  }'
```

### Создание пользователя госоргана

```bash
curl -X POST http://localhost:3003/api/auth/create-organ-control \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-admin-secret-key" \
  -d '{
    "email": "control@gov.ru",
    "password": "Control123!",
    "fullName": "Орган контроля"
  }'
```

## Инициализация ролей

Для создания базовых ролей выполните:

```bash
npm run init-roles
```

Это создаст роли:
- `admin` - Администратор
- `contractor` - Подрядчик
- `organ_control` - Орган контроля

## Безопасность

- Пароли хешируются с помощью bcrypt (12 раундов)
- Email должен быть уникальным
- Названия ролей должны быть уникальными
- Валидация входных данных через Zod
- Защищенные API с секретными ключами
- Ограничение на количество админов и пользователей госоргана (по одному)

## Переменные окружения

Создайте файл `.env` на основе `env.example`:

```bash
cp env.example .env
```

Обязательные переменные:
- `ADMIN_SECRET_KEY` - ключ для создания пользователей госоргана
- `SYSTEM_SECRET_KEY` - ключ для создания администратора
- `ADMIN_ROLE_ID` - ID роли администратора
- `ORGAN_CONTROL_ROLE_ID` - ID роли госоргана

## Получение ID ролей

После создания ролей получите их ID:

```bash
npm run get-role-ids
```

Скопируйте полученные ID в ваш `.env` файл.

## Зависимости

- `bcrypt` - хеширование паролей
- `@prisma/client` - работа с базой данных
- `zod` - валидация данных
