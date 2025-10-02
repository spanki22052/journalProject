import { Router } from "express";
import { z } from "zod";
import type {
  UserUseCases,
  AuthUseCases,
} from "../application/use-cases";
import { sessionAuth, requireAdmin, requireContractor, requireInspector, requireAnyRole, adminAuth, systemAuth } from "../middleware/session-auth.js";
import { SYSTEM_ROLES } from "../constants/roles";
import type { AuthRepository } from "../domain/repository";

// Схемы валидации для пользователей
const createUserSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  fullName: z.string().min(1, "Полное имя обязательно"),
  role: z.enum(["CONTRACTOR", "INSPECTOR"]).optional(), // Убираем ADMIN из обычной регистрации
});

const updateUserSchema = z.object({
  email: z.string().email("Некорректный email").optional(),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").optional(),
  fullName: z.string().min(1, "Полное имя обязательно").optional(),
  role: z.enum(["ADMIN", "CONTRACTOR", "INSPECTOR"]).optional(),
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
});

export function createAuthRoutes(
  userUseCases: UserUseCases,
  authUseCases: AuthUseCases,
  authRepository: AuthRepository,
  req: any,
  res: any
): Router {
  const router = Router();

  // === РОЛИ ===
  
  // Получить доступные роли
  router.get("/roles", (req, res) => {
    res.json([
      { value: "ADMIN", label: "Администратор" },
      { value: "CONTRACTOR", label: "Подрядчик" },
      { value: "INSPECTOR", label: "Инспектор" },
    ]);
  });

  // === ПОЛЬЗОВАТЕЛИ ===

  // Создать пользователя (только админом)
  router.post("/users", sessionAuth(authRepository), requireAdmin(authRepository), async (req, res) => {
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

  // Получить всех пользователей (только админом)
  router.get("/users", sessionAuth(authRepository), requireAdmin(authRepository), async (req, res) => {
    try {
      const { role, email, fullName } = req.query;
      const filters = {
        ...(role && { role: role as "ADMIN" | "CONTRACTOR" | "INSPECTOR" }),
        ...(email && { email: email as string }),
        ...(fullName && { fullName: fullName as string }),
      };
      const users = await userUseCases.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // Получить пользователя по ID (только админом)
  router.get("/users/:id", sessionAuth(authRepository), requireAdmin(authRepository), async (req, res) => {
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

  // Обновить пользователя (только админом)
  router.put("/users/:id", sessionAuth(authRepository), requireAdmin(authRepository), async (req, res) => {
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

  // Удалить пользователя (только админом)
  router.delete("/users/:id", sessionAuth(authRepository), requireAdmin(authRepository), async (req, res) => {
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
      
      // Ждем сохранения сессии перед отправкой ответа
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session in login:', err);
          res.status(500).json({ error: "Ошибка создания сессии" });
          return;
        }
        res.json(result);
      });
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

  // Проверка сессии
  router.get("/verify", (req, res) => {
    if (authRepository.isAuthenticated()) {
      const user = authRepository.getCurrentUser();
      res.json({ 
        valid: true, 
        user: user
      });
    } else {
      res.status(401).json({ 
        valid: false, 
        error: 'Сессия не найдена' 
      });
    }
  });

  // Получить текущего пользователя
  router.get("/me", async (req, res) => {
    try {
      if (!authRepository.isAuthenticated()) {
        return res.status(401).json({ error: "Пользователь не авторизован" });
      }

      const currentUser = authRepository.getCurrentUser();
      if (!currentUser) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const user = await userUseCases.getUserById(currentUser.userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
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

  // Создать инспектора (только с ключом админа)
  router.post("/create-inspector", adminAuth, async (req, res) => {
    try {
      const data = createUserSchema.parse(req.body);

      const user = await userUseCases.createInspectorUser(data);

      res.status(201).json({
        message: "Инспектор успешно создан",
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

  // === ВЫХОД ===

  // Выход из системы
  router.post("/logout", async (req, res) => {
    try {
      authRepository.destroySession();
      res.json({ message: "Выход выполнен успешно" });
    } catch (error) {
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // === СМЕНА ПАРОЛЯ ===

  // Сменить пароль (требует авторизации)
  router.post("/change-password", async (req, res) => {
    try {
      if (!authRepository.isAuthenticated()) {
        return res.status(401).json({ error: "Пользователь не авторизован" });
      }

      const currentUser = authRepository.getCurrentUser();
      if (!currentUser) {
        return res.status(401).json({ error: "Пользователь не найден" });
      }

      const data = changePasswordSchema.parse(req.body);
      const success = await authRepository.changePassword(currentUser.userId, data);

      if (!success) {
        return res.status(400).json({ error: "Неверный текущий пароль" });
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

  return router;
}
