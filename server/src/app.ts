import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { loadConfig } from "./config/env";
import { ChatModule } from "./modules/chat";

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

// Инициализация модуля чата
const chatModule = new ChatModule({
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    bucketName: process.env.MINIO_BUCKET_NAME || "chat-files",
  },
});

// Инициализация модуля
chatModule
  .initialize()
  .then(() => {
    console.log("Chat module initialized");
  })
  .catch(console.error);

// Настройка WebSocket
chatModule.setupWebSocket(io);

// API роуты
app.use("/api/chat", chatModule.createRoutes());

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
