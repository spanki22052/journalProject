import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import type { ChatUseCases } from "../application/use-cases";
import { minioService } from "../../../infra/minio.js";
import { sessionAuth, requireAnyRole } from "../../auth/middleware/session-auth.js";
import type { AuthRepository } from "../../auth/domain/repository";

export function createChatRoutes(chatUseCases: ChatUseCases, authRepository: AuthRepository): Router {
  const router = Router();

  // Настройка multer для загрузки файлов
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Схемы валидации
  const createMessageSchema = z.object({
    content: z.string().min(1, "Содержимое сообщения обязательно"),
    type: z
      .enum(["TEXT", "IMAGE", "FILE", "SYSTEM"])
      .optional()
      .default("TEXT"),
    author: z.string().min(1, "Автор обязателен"),
    taskId: z.string().optional(),
    isEditSuggestion: z.boolean().optional().default(false),
    isCompletionConfirmation: z.boolean().optional().default(false),
  });

  const suggestEditSchema = z.object({
    content: z.string().min(1, "Содержимое предложения обязательно"),
    author: z.string().min(1, "Автор обязателен"),
    taskId: z.string().min(1, "ID задачи обязателен"),
  });

  const confirmCompletionSchema = z.object({
    content: z.string().min(1, "Содержимое подтверждения обязательно"),
    author: z.string().min(1, "Автор обязателен"),
    taskId: z.string().optional(),
    type: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]).optional(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
  });

  const updateMessageSchema = z.object({
    content: z.string().min(1).optional(),
    type: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]).optional(),
    author: z.string().min(1).optional(),
    taskId: z.string().optional(),
    isEditSuggestion: z.boolean().optional(),
    isCompletionConfirmation: z.boolean().optional(),
  });

  // GET /api/chats - Получить все чаты (с фильтрацией по роли)
  router.get("/", sessionAuth(authRepository), async (req, res) => {
    try {
      const currentUser = authRepository.getCurrentUser();
      const chats = await chatUseCases.getAllChats(currentUser);
      res.json(chats);
    } catch (error) {
      console.error("Ошибка при получении чатов:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // GET /api/chats/object/:objectId - Получить чат по ID объекта
  router.get("/object/:objectId", async (req, res) => {
    try {
      const { objectId } = req.params;
      const chat = await chatUseCases.getOrCreateChatByObjectId(objectId);
      res.json(chat);
    } catch (error) {
      console.error("Ошибка при получении чата:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // POST /api/chats/:chatId/messages - Создать сообщение в чате
  router.post("/:chatId/messages", async (req, res) => {
    try {
      const { chatId } = req.params;
      const validatedData = createMessageSchema.parse(req.body);

      const message = await chatUseCases.createMessage({
        chatId,
        ...validatedData,
      });

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Ошибка валидации", details: error.errors });
      }
      console.error("Ошибка при создании сообщения:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // GET /api/chats/:chatId/messages - Получить сообщения чата
  router.get("/:chatId/messages", async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await chatUseCases.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // POST /api/chats/:chatId/suggest-edit - Предложить правку (только для INSPECTOR)
  router.post("/:chatId/suggest-edit", sessionAuth(authRepository), requireAnyRole(authRepository)('INSPECTOR'), async (req, res) => {
    try {
      const { chatId } = req.params;
      const validatedData = suggestEditSchema.parse(req.body);

      const message = await chatUseCases.suggestEdit(chatId, validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Ошибка валидации", details: error.errors });
      }
      console.error("Ошибка при создании предложения правки:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // POST /api/chats/:chatId/confirm-completion - Подтвердить выполнение (только для CONTRACTOR)
  router.post("/:chatId/confirm-completion", sessionAuth(authRepository), requireAnyRole(authRepository)('CONTRACTOR'), async (req, res) => {
    try {
      const { chatId } = req.params;
      const validatedData = confirmCompletionSchema.parse(req.body);

      const message = await chatUseCases.createCompletionConfirmation(
        chatId,
        validatedData
      );
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Ошибка валидации", details: error.errors });
      }
      console.error("Ошибка при подтверждении выполнения:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // PUT /api/chats/messages/:messageId - Обновить сообщение
  router.put("/messages/:messageId", async (req, res) => {
    try {
      const { messageId } = req.params;
      const validatedData = updateMessageSchema.parse(req.body);

      const message = await chatUseCases.updateMessage(
        messageId,
        validatedData
      );
      if (!message) {
        return res.status(404).json({ error: "Сообщение не найдено" });
      }

      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Ошибка валидации", details: error.errors });
      }
      console.error("Ошибка при обновлении сообщения:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // DELETE /api/chats/messages/:messageId - Удалить сообщение
  router.delete("/messages/:messageId", async (req, res) => {
    try {
      const { messageId } = req.params;
      const success = await chatUseCases.deleteMessage(messageId);

      if (!success) {
        return res.status(404).json({ error: "Сообщение не найдено" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Ошибка при удалении сообщения:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // POST /api/chats/upload - Загрузить файл
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Файл не предоставлен" });
      }

      const { originalname, buffer, mimetype, size } = req.file;

      // Загружаем файл в MinIO
      const objectName = await minioService.uploadFile(
        buffer,
        originalname,
        mimetype
      );

      // Получаем URL файла
      const fileUrl = await minioService.getFileUrl(objectName);

      res.json({
        objectName,
        fileUrl,
        fileName: originalname,
        fileSize: size,
        mimeType: mimetype,
      });
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  return router;
}
