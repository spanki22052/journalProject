import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import {
  SendMessageUseCase,
  GetRoomMessagesUseCase,
  UploadFileUseCase,
  GetFileUrlUseCase,
} from "../application/use-cases";
import { jwtAuth } from "../../auth/middleware/jwt-auth";
import type { AuthRepository } from "../../auth/domain/repository";

const upload = multer({ storage: multer.memoryStorage() });

const SendMessageSchema = z.object({
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderRole: z.enum(["ADMIN", "CONTRACTOR", "ORGAN_CONTROL"]),
  content: z.string().min(1),
  recognizedInfo: z.string().optional(),
  files: z.array(z.string()).optional(),
});

export function createChatRoutes(
  sendMessageUseCase: SendMessageUseCase,
  getRoomMessagesUseCase: GetRoomMessagesUseCase,
  uploadFileUseCase: UploadFileUseCase,
  getFileUrlUseCase: GetFileUrlUseCase,
  authRepository: AuthRepository
) {
  const router = Router();

  // Получить сообщения комнаты (требует авторизации)
  router.get("/rooms/:roomId/messages", jwtAuth(authRepository), async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await getRoomMessagesUseCase.execute(roomId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Отправить сообщение (требует авторизации)
  router.post("/messages", jwtAuth(authRepository), async (req, res) => {
    try {
      const parsed = SendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      // Добавляем информацию о пользователе из JWT токена
      const messageData = {
        ...parsed.data,
        senderId: req.user?.userId || parsed.data.senderId,
        senderRole: (req.user?.role as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL") || parsed.data.senderRole,
      };

      const message = await sendMessageUseCase.execute(messageData);
      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Загрузить файл (требует авторизации)
  router.post("/upload", jwtAuth(authRepository), upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const filePath = await uploadFileUseCase.execute(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({ filePath });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Получить URL файла (требует авторизации)
  router.get("/files/:filePath", jwtAuth(authRepository), async (req, res) => {
    try {
      const { filePath } = req.params;
      const url = await getFileUrlUseCase.execute(decodeURIComponent(filePath));
      res.json({ url });
    } catch (error) {
      res.status(500).json({ error: "Failed to get file URL" });
    }
  });

  return router;
}
