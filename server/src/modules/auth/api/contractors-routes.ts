import { Router } from "express";
import type { UserUseCases } from "../application/use-cases";
import { sessionAuth } from "../middleware/session-auth";
import type { AuthRepository } from "../domain/repository";

export function createContractorsRoutes(
  userUseCases: UserUseCases,
  authRepository: AuthRepository
): Router {
  const router = Router();

  // Получить список всех подрядчиков (требуется аутентификация)
  router.get("/", sessionAuth(authRepository), async (req, res) => {
    try {
      const contractors = await userUseCases.getContractors();
      res.json(contractors);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  return router;
}
