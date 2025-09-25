# Chat Module - Документация

Модульный чат с поддержкой файлов и WebSocket для real-time общения.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск MinIO (Docker)
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Запуск сервера
npm run dev
```

## 📡 API Endpoints

### Сообщения
```http
GET /api/chat/rooms/:roomId/messages
```
Получить все сообщения комнаты

```http
POST /api/chat/messages
Content-Type: application/json

{
  "roomId": "room-123",
  "senderId": "user-uuid",
  "senderName": "Амир",
  "senderRole": "contractor",
  "content": "Купить люк",
  "recognizedInfo": "ТТН #214325, Сумма: 1500",
  "files": ["chat/uuid_manhole.jpg"]
}
```

### Файлы
```http
POST /api/chat/upload
Content-Type: multipart/form-data

file: [файл]
```

```http
GET /api/chat/files/:filePath
```
Получить временную ссылку на файл

## 🔌 WebSocket Events

### Клиент → Сервер
```javascript
// Присоединиться к комнате
socket.emit('join_room', {
  roomId: 'room-123',
  userId: 'user-uuid'
});

// Отправить сообщение
socket.emit('send_message', {
  roomId: 'room-123',
  senderId: 'user-uuid',
  senderName: 'Амир',
  senderRole: 'contractor',
  content: 'Купить люк',
  files: ['chat/uuid_manhole.jpg']
});

// Покинуть комнату
socket.emit('leave_room', {
  roomId: 'room-123',
  userId: 'user-uuid'
});
```

### Сервер → Клиент
```javascript
// Успешно присоединились
socket.on('joined_room', (data) => {
  console.log(`Joined room: ${data.roomId}`);
});

// Новое сообщение
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Сообщение отправлено
socket.on('message_sent', (data) => {
  console.log(`Message sent: ${data.messageId}`);
});

// Ошибка
socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

## 🏗️ Архитектура

### Clean Architecture
```
src/modules/chat/
├── domain/           # Сущности и порты
│   ├── entities.ts   # Message
│   └── ports.ts      # Интерфейсы репозиториев
├── application/      # Бизнес-логика
│   └── use-cases.ts  # Use cases
├── infra/           # Инфраструктура
│   ├── repositories.ts      # In-memory репозиторий
│   └── websocket-service.ts # Socket.IO сервис
└── api/             # HTTP и WebSocket API
    ├── routes.ts           # REST endpoints
    └── websocket-handlers.ts # WS обработчики
```

### Модульность
```typescript
// Создание модуля
const chatModule = new ChatModule({
  minio: {
    endPoint: 'localhost',
    port: 9000,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    bucketName: 'chat-files'
  }
});

// Инициализация
await chatModule.initialize();

// Настройка WebSocket
chatModule.setupWebSocket(io);

// Получение роутов
app.use('/api/chat', chatModule.createRoutes());
```

## 📝 Структура сообщения

```typescript
interface Message {
  id: string;                    // UUID
  roomId: string;                // ID комнаты
  senderId: string;              // UUID отправителя
  senderName: string;            // Имя отправителя
  senderRole: 'contractor' | 'customer';
  content: string;               // Текст сообщения
  recognizedInfo?: string;       // Распознанная информация
  files: string[];               // Пути к файлам в MinIO
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Конфигурация

### Environment Variables
```bash
# Server
NODE_ENV=development
PORT=3000

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=chat-files
```

## 🎯 Примеры использования

### 1. Создание чата с файлами
```javascript
// 1. Загрузить файл
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('/api/chat/upload', {
  method: 'POST',
  body: formData
});
const { filePath } = await uploadResponse.json();

// 2. Отправить сообщение с файлом
const messageResponse = await fetch('/api/chat/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomId: 'room-123',
    senderId: 'user-uuid',
    senderName: 'Амир',
    senderRole: 'contractor',
    content: 'Купить люк',
    files: [filePath]
  })
});
```

### 2. WebSocket чат
```javascript
const socket = io('http://localhost:3000');

// Присоединиться к комнате
socket.emit('join_room', {
  roomId: 'room-123',
  userId: 'user-uuid'
});

// Слушать новые сообщения
socket.on('new_message', (message) => {
  displayMessage(message);
});

// Отправить сообщение
function sendMessage(content) {
  socket.emit('send_message', {
    roomId: 'room-123',
    senderId: 'user-uuid',
    senderName: 'Амир',
    senderRole: 'contractor',
    content: content
  });
}
```

## 🔄 Переиспользование модуля

Модуль можно легко использовать в других проектах:

```typescript
// В новом проекте
import { ChatModule } from '@your-org/chat-module';

const chatModule = new ChatModule({
  minio: { /* ваша конфигурация MinIO */ }
});

await chatModule.initialize();
app.use('/api/chat', chatModule.createRoutes());
```

## 🛠️ Разработка

```bash
# Dev режим с hot reload
npm run dev

# Сборка
npm run build

# Запуск продакшн версии
npm start
```

## 📦 Зависимости

- **Express** - HTTP сервер
- **Socket.IO** - WebSocket
- **MinIO** - Файловое хранилище
- **Multer** - Загрузка файлов
- **Zod** - Валидация данных
- **UUID** - Генерация ID
