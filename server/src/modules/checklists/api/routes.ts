import { Router } from "express";
import { z } from "zod";
import type { ChecklistUseCases } from "../application/use-cases";
import { sessionAuth, requireAnyRole } from "../../auth/middleware/session-auth.js";
import type { AuthRepository } from "../../auth/domain/repository";

const createChecklistSchema = z.object({
  objectId: z.string().min(1, "ID объекта обязателен"),
  title: z.string().min(1, "Название чеклиста обязательно"),
});

const updateChecklistSchema = z.object({
  title: z.string().min(1).optional(),
});

const createChecklistItemSchema = z.object({
  checklistId: z.string().min(1, "ID чеклиста обязателен"),
  text: z.string().min(1, "Текст задачи обязателен"),
});

const updateChecklistItemSchema = z.object({
  text: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

export function createChecklistRoutes(
  checklistUseCases: ChecklistUseCases,
  authRepository: AuthRepository
): Router {
  const router = Router();

  // Создать чеклист (только админ и подрядчик)
  router.post("/", sessionAuth(authRepository), requireAnyRole(authRepository)('ADMIN', 'CONTRACTOR'), async (req, res) => {
    try {
      const data = createChecklistSchema.parse(req.body);
      const checklist = await checklistUseCases.createChecklist(data);
      res.status(201).json(checklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Неверные данные", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить чеклист по ID (требуется аутентификация)
  router.get("/:id", sessionAuth(authRepository), async (req, res) => {
    try {
      const { id } = req.params;
      const checklist = await checklistUseCases.getChecklistById(id);

      if (!checklist) {
        res.status(404).json({ error: "Чеклист не найден" });
        return;
      }

      res.json(checklist);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить чеклисты по ID объекта (требуется аутентификация)
  router.get("/object/:objectId", sessionAuth(authRepository), async (req, res) => {
    try {
      const { objectId } = req.params;
      const checklists = await checklistUseCases.getChecklistsByObjectId(
        objectId
      );
      res.json(checklists);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Обновить чеклист (только админ и подрядчик)
  router.put("/:id", sessionAuth(authRepository), requireAnyRole(authRepository)('ADMIN', 'CONTRACTOR'), async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateChecklistSchema.parse(req.body);
      const checklist = await checklistUseCases.updateChecklist(id, data);

      if (!checklist) {
        res.status(404).json({ error: "Чеклист не найден" });
        return;
      }

      res.json(checklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Неверные данные", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Удалить чеклист (только админ)
  router.delete("/:id", sessionAuth(authRepository), requireAnyRole(authRepository)('ADMIN'), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await checklistUseCases.deleteChecklist(id);

      if (!success) {
        res.status(404).json({ error: "Чеклист не найден" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Checklist Items routes
  const itemsRouter = Router();

  // Создать элемент чеклиста
  itemsRouter.post("/", async (req, res) => {
    try {
      const data = createChecklistItemSchema.parse(req.body);
      const item = await checklistUseCases.createChecklistItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Неверные данные", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить элемент чеклиста по ID
  itemsRouter.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await checklistUseCases.getChecklistItemById(id);

      if (!item) {
        res.status(404).json({ error: "Элемент чеклиста не найден" });
        return;
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить элементы чеклиста по ID чеклиста
  itemsRouter.get("/checklist/:checklistId", async (req, res) => {
    try {
      const { checklistId } = req.params;
      const items = await checklistUseCases.getChecklistItemsByChecklistId(
        checklistId
      );
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Обновить элемент чеклиста
  itemsRouter.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateChecklistItemSchema.parse(req.body);
      const item = await checklistUseCases.updateChecklistItem(id, data);

      if (!item) {
        res.status(404).json({ error: "Элемент чеклиста не найден" });
        return;
      }

      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Неверные данные", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Удалить элемент чеклиста
  itemsRouter.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await checklistUseCases.deleteChecklistItem(id);

      if (!success) {
        res.status(404).json({ error: "Элемент чеклиста не найден" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Подключаем роуты для элементов чеклиста
  router.use("/items", itemsRouter);

  return router;
}
