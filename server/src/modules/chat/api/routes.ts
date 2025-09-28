import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import {
  SendMessageUseCase,
  GetRoomMessagesUseCase,
  UploadFileUseCase,
  GetFileUrlUseCase,
} from "../application/use-cases";

const upload = multer({ storage: multer.memoryStorage() });

const SendMessageSchema = z.object({
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderRole: z.enum(["contractor", "customer"]),
  content: z.string().min(1),
  recognizedInfo: z.string().optional(),
  files: z.array(z.string()).optional(),
});

export function createChatRoutes(
  sendMessageUseCase: SendMessageUseCase,
  getRoomMessagesUseCase: GetRoomMessagesUseCase,
  uploadFileUseCase: UploadFileUseCase,
  getFileUrlUseCase: GetFileUrlUseCase
) {
  const router = Router();

  // Получить сообщения комнаты
  router.get("/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await getRoomMessagesUseCase.execute(roomId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Отправить сообщение
  router.post("/messages", async (req, res) => {
    try {
      const parsed = SendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }

      const message = await sendMessageUseCase.execute(parsed.data);
      res.status(201).json({ message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Загрузить файл
  router.post("/upload", upload.single("file"), async (req, res) => {
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

  // Получить URL файла
  router.get("/files/:filePath", async (req, res) => {
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
