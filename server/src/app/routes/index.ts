import { Router } from "express";
import { ChatModule } from "../../modules/chat";

// Создаем экземпляр модуля чата
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

// Инициализируем модуль чата
chatModule
  .initialize()
  .then(() => {
    console.log("Chat module initialized");
  })
  .catch(console.error);

// Создаем основной роутер
const router = Router();

// Подключаем роуты чата
router.use("/chat", chatModule.createRoutes());

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
export { chatModule };
