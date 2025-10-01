import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { loadConfig } from "./config/env.js";
import { sessionConfig } from "./infra/session.js";
import { ChatModule } from "./modules/chat/index.js";
import { prisma } from "./infra/prisma.js";
import { PrismaObjectRepository } from "./modules/objects/infrastructure/prisma-object-repository.js";
import { ObjectUseCases } from "./modules/objects/application/use-cases.js";
import { createObjectRoutes } from "./modules/objects/api/routes.js";
import { PrismaUserRepository } from "./modules/auth/infrastructure/prisma-user-repository.js";
import { SessionAuthRepository } from "./modules/auth/infrastructure/session-auth-repository.js";
import { UserUseCases, AuthUseCases } from "./modules/auth/application/use-cases.js";
import { createAuthRoutes } from "./modules/auth/api/routes.js";
import {
  PrismaChecklistRepository,
  PrismaChecklistItemRepository,
} from "./modules/checklists/infrastructure/prisma-checklist-repository.js";
import { ChecklistUseCases } from "./modules/checklists/application/use-cases.js";
import { createChecklistRoutes } from "./modules/checklists/api/routes.js";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Важно для сессий
}));
app.use(express.json());
app.use(sessionConfig);

// Инициализация репозиториев
const objectRepository = new PrismaObjectRepository(prisma);
const checklistRepository = new PrismaChecklistRepository(prisma);
const checklistItemRepository = new PrismaChecklistItemRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

// Инициализация use cases
const objectUseCases = new ObjectUseCases(objectRepository);
const checklistUseCases = new ChecklistUseCases(
  checklistRepository,
  checklistItemRepository
);

// Инициализация auth use cases
const userUseCases = new UserUseCases(userRepository);
const authUseCases = new AuthUseCases(userRepository, null as any); // Будет инициализирован в middleware
// Инициализация модуля чата (временно отключен)
// const chatModule = new ChatModule({
//   minio: {
//     endPoint: process.env.MINIO_ENDPOINT || "localhost",
//     port: parseInt(process.env.MINIO_PORT || "9000"),
//     useSSL: process.env.MINIO_USE_SSL === "true",
//     accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
//     secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
//     bucketName: process.env.MINIO_BUCKET_NAME || "chat-files",
//   },
// });

// Инициализация модуля
// chatModule
//   .initialize()
//   .then(() => {
//     console.log("Chat module initialized");
//   })
//   .catch(console.error);

// Настройка WebSocket
// chatModule.setupWebSocket(io);

// API роуты
// app.use("/api/chat", chatModule.createRoutes());
app.use("/api/objects", (req, res, next) => {
  const authRepository = new SessionAuthRepository(prisma, req, res);
  const objectRoutes = createObjectRoutes(objectUseCases, authRepository);
  objectRoutes(req, res, next);
});
app.use("/api/checklists", (req, res, next) => {
  const authRepository = new SessionAuthRepository(prisma, req, res);
  const checklistRoutes = createChecklistRoutes(checklistUseCases, authRepository);
  checklistRoutes(req, res, next);
});

// Auth роуты с session-based аутентификацией
app.use("/api/auth", (req, res, next) => {
  const authRepository = new SessionAuthRepository(prisma, req, res);
  const authUseCases = new AuthUseCases(userRepository, authRepository);
  const authRoutes = createAuthRoutes(userUseCases, authUseCases, authRepository, req, res);
  authRoutes(req, res, next);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const config = loadConfig();
const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}`);
});

export { app, server, io };
