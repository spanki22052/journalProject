import { Router } from "express";
import { z } from "zod";
import type { ObjectUseCases } from "../application/use-cases.js";

const createObjectSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  type: z.enum(["PROJECT", "TASK", "SUBTASK"]).optional().default("PROJECT"),
  assignee: z.string().min(1, "Ответственный обязателен"),
  startDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  endDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str)),
  progress: z.number().min(0).max(100).optional().default(0),
  isExpanded: z.boolean().optional().default(false),
});

const updateObjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["PROJECT", "TASK", "SUBTASK"]).optional(),
  assignee: z.string().optional(),
  startDate: z
    .string()
    .datetime()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  endDate: z
    .string()
    .datetime()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  progress: z.number().min(0).max(100).optional(),
  isExpanded: z.boolean().optional(),
});

const querySchema = z.object({
  type: z.enum(["PROJECT", "TASK", "SUBTASK"]).optional(),
  assignee: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

export function createObjectRoutes(objectUseCases: ObjectUseCases): Router {
  const router = Router();

  // Создать объект
  router.post("/", async (req, res) => {
    try {
      const data = createObjectSchema.parse(req.body);
      const object = await objectUseCases.createObject(data);
      res.status(201).json(object);
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

  // Получить все объекты
  router.get("/", async (req, res) => {
    try {
      const filters = querySchema.parse(req.query);
      const objects = await objectUseCases.getAllObjects(filters);
      const total = await objectUseCases.getObjectsCount(filters);

      res.json({
        data: objects,
        total,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Неверные параметры запроса", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить объект по ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const object = await objectUseCases.getObjectById(id);

      if (!object) {
        res.status(404).json({ error: "Объект не найден" });
        return;
      }

      res.json(object);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Обновить объект
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateObjectSchema.parse(req.body);
      const object = await objectUseCases.updateObject(id, data);

      if (!object) {
        res.status(404).json({ error: "Объект не найден" });
        return;
      }

      res.json(object);
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

  // Удалить объект
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await objectUseCases.deleteObject(id);

      if (!success) {
        res.status(404).json({ error: "Объект не найден" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  return router;
}
