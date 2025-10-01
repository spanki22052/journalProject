import { Router } from "express";
import { z } from "zod";
import type {
  UserUseCases,
  AuthUseCases,
} from "../application/use-cases";
import { adminAuth, systemAuth } from "../middleware/admin-auth";
import { jwtAuth, requireAdmin, requireAnyRole } from "../middleware/jwt-auth";
import { SYSTEM_ROLES } from "../constants/roles";
import type { AuthRepository } from "../domain/repository";

// Схемы валидации для пользователей
const createUserSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  fullName: z.string().min(1, "Полное имя обязательно"),
  role: z.enum(["ADMIN", "CONTRACTOR", "ORGAN_CONTROL"]).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email("Некорректный email").optional(),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").optional(),
  fullName: z.string().min(1, "Полное имя обязательно").optional(),
  role: z.enum(["ADMIN", "CONTRACTOR", "ORGAN_CONTROL"]).optional(),
});

// Схема валидации для входа
const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

// Схемы валидации для восстановления пароля
const passwordResetRequestSchema = z.object({
  email: z.string().email("Некорректный email"),
});

const passwordResetSchema = z.object({
  token: z.string().min(1, "Токен обязателен"),
  newPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export function createAuthRoutes(
  userUseCases: UserUseCases,
  authUseCases: AuthUseCases,
  authRepository: AuthRepository
): Router {
  const router = Router();

  // === РОЛИ ===
  
  // Получить доступные роли
  router.get("/roles", (req, res) => {
    res.json([
      { value: "ADMIN", label: "Администратор" },
      { value: "CONTRACTOR", label: "Подрядчик" },
      { value: "ORGAN_CONTROL", label: "Орган контроля" },
    ]);
  });

  // === ПОЛЬЗОВАТЕЛИ ===

  // Создать пользователя
  router.post("/users", async (req, res) => {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userUseCases.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить всех пользователей
  router.get("/users", async (req, res) => {
    try {
      const { role, email, fullName } = req.query;
      const filters = {
        ...(role && { role: role as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL" }),
        ...(email && { email: email as string }),
        ...(fullName && { fullName: fullName as string }),
      };
      const users = await userUseCases.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить пользователя по ID
  router.get("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userUseCases.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "Пользователь не найден" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Обновить пользователя
  router.put("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);
      const user = await userUseCases.updateUser(id, data);
      if (!user) {
        res.status(404).json({ error: "Пользователь не найден" });
        return;
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Удалить пользователя
  router.delete("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await userUseCases.deleteUser(id);
      if (!success) {
        res.status(404).json({ error: "Пользователь не найден" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // === АУТЕНТИФИКАЦИЯ ===

  // Вход в систему
  router.post("/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authUseCases.login(data);
      if (!result) {
        res.status(401).json({ error: "Неверный email или пароль" });
        return;
      }
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Проверка токена
  router.get("/verify", jwtAuth(authRepository), (req, res) => {
    res.json({ 
      valid: true, 
      user: req.user 
    });
  });

  // Получить текущего пользователя
  router.get("/me", jwtAuth(authRepository), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Пользователь не авторизован" });
      }

      const user = await userUseCases.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // === ВОССТАНОВЛЕНИЕ ПАРОЛЯ ===

  // Запрос на восстановление пароля
  router.post("/forgot-password", async (req, res) => {
    try {
      const data = passwordResetRequestSchema.parse(req.body);
      const result = await authRepository.requestPasswordReset(data);

      if (!result) {
        // Всегда возвращаем успех для безопасности
        return res.json({ 
          message: "Если пользователь с таким email существует, на него будет отправлена ссылка для восстановления пароля" 
        });
      }

      // В реальном приложении здесь должна быть отправка email
      console.log(`Password reset token for ${data.email}: ${result.token}`);
      console.log(`Token expires at: ${result.expiresAt}`);

      res.json({ 
        message: "Если пользователь с таким email существует, на него будет отправлена ссылка для восстановления пароля",
        // В development режиме возвращаем токен для тестирования
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken: result.token,
          expiresAt: result.expiresAt 
        })
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Сброс пароля по токену
  router.post("/reset-password", async (req, res) => {
    try {
      const data = passwordResetSchema.parse(req.body);
      const success = await authRepository.resetPassword(data);

      if (!success) {
        return res.status(400).json({ error: "Недействительный или истекший токен" });
      }

      res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // === ЗАЩИЩЕННЫЕ API ===

  // Создать администратора (только с системным ключом)
  router.post("/create-admin", systemAuth, async (req, res) => {
    try {
      const data = createUserSchema.parse(req.body);

      const user = await userUseCases.createAdminUser(data);

      res.status(201).json({
        message: "Администратор успешно создан",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Создать пользователя госоргана (только с ключом админа)
  router.post("/create-organ-control", adminAuth, async (req, res) => {
    try {
      const data = createUserSchema.parse(req.body);

      const user = await userUseCases.createOrganControlUser(data);

      res.status(201).json({
        message: "Пользователь госоргана успешно создан",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Неверные данные", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  return router;
}
