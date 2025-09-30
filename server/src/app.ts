import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { loadConfig } from "./config/env.js";
import { ChatsModule } from "./modules/chats/index.js";
import { prisma } from "./infra/prisma.js";
import { PrismaObjectRepository } from "./modules/objects/infrastructure/prisma-object-repository.js";
import { ObjectUseCases } from "./modules/objects/application/use-cases.js";
import { createObjectRoutes } from "./modules/objects/api/routes.js";
import {
  PrismaChecklistRepository,
  PrismaChecklistItemRepository,
} from "./modules/checklists/infrastructure/prisma-checklist-repository.js";
import { ChecklistUseCases } from "./modules/checklists/application/use-cases.js";
import { createChecklistRoutes } from "./modules/checklists/api/routes.js";
import { minioService } from "./infra/minio.js";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация репозиториев
const objectRepository = new PrismaObjectRepository(prisma);
const checklistRepository = new PrismaChecklistRepository(prisma);
const checklistItemRepository = new PrismaChecklistItemRepository(prisma);

// Инициализация use cases
const objectUseCases = new ObjectUseCases(objectRepository);
const checklistUseCases = new ChecklistUseCases(
  checklistRepository,
  checklistItemRepository
);

// Инициализация модуля чатов с WebSocket поддержкой
const chatsModule = new ChatsModule({ prisma });

// Инициализация модулей
chatsModule
  .initialize()
  .then(() => {
    console.log("Chats module initialized");
  })
  .catch(console.error);

// Настройка WebSocket для модуля чатов
chatsModule.setupWebSocket(io);

// API роуты
app.use("/api/objects", createObjectRoutes(objectUseCases));
app.use("/api/checklists", createChecklistRoutes(checklistUseCases));
app.use("/api/chats", chatsModule.createRoutes());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Инициализация MinIO
async function initializeMinIO() {
  try {
    await minioService.initialize();
    console.log("✅ MinIO инициализирован");
  } catch (error) {
    console.error("❌ Ошибка инициализации MinIO:", error);
    // Не останавливаем приложение, если MinIO недоступен
  }
}

const config = loadConfig();
const PORT = config.PORT;

// Инициализируем MinIO при запуске
initializeMinIO();

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}`);
});

export { app, server, io };
