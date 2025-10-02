import { Request, Response, NextFunction } from 'express';
import type { AuthRepository } from '../domain/repository';

// Middleware для проверки аутентификации через сессии
export const sessionAuth = (authRepository: AuthRepository) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!authRepository.isAuthenticated()) {
      return res.status(401).json({ 
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
    }
    next();
  };
};

// Middleware для проверки роли администратора
export const requireAdmin = (authRepository: AuthRepository) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!authRepository.isAuthenticated()) {
      return res.status(401).json({ 
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
    }

    const currentUser = authRepository.getCurrentUser();
    if (!currentUser || currentUser.userRole !== 'ADMIN') {
      return res.status(403).json({ 
        error: "Доступ запрещен",
        message: "Требуются права администратора"
      });
    }
    next();
  };
};

// Middleware для проверки роли подрядчика
export const requireContractor = (authRepository: AuthRepository) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!authRepository.isAuthenticated()) {
      return res.status(401).json({ 
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
    }

    const currentUser = authRepository.getCurrentUser();
    if (!currentUser || currentUser.userRole !== 'CONTRACTOR') {
      return res.status(403).json({ 
        error: "Доступ запрещен",
        message: "Требуются права подрядчика"
      });
    }
    next();
  };
};

// Middleware для проверки роли инспектора
export const requireInspector = (authRepository: AuthRepository) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!authRepository.isAuthenticated()) {
      return res.status(401).json({ 
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
    }

    const currentUser = authRepository.getCurrentUser();
    if (!currentUser || currentUser.userRole !== 'INSPECTOR') {
      return res.status(403).json({ 
        error: "Доступ запрещен",
        message: "Требуются права инспектора"
      });
    }
    next();
  };
};

// Middleware для проверки любой из указанных ролей
export const requireAnyRole = (authRepository: AuthRepository) => {
  return (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!authRepository.isAuthenticated()) {
        return res.status(401).json({ 
          error: "Требуется авторизация",
          message: "Пользователь не авторизован"
        });
      }

      const currentUser = authRepository.getCurrentUser();
      if (!currentUser || !roles.includes(currentUser.userRole)) {
        return res.status(403).json({ 
          error: "Доступ запрещен",
          message: `Требуется одна из ролей: ${roles.join(', ')}`
        });
      }
      next();
    };
  };
};

// Middleware для системной авторизации (для внутренних вызовов)
export const systemAuth = (req: Request, res: Response, next: NextFunction) => {
  const systemKey = req.headers['x-system-key'] as string;
  const expectedKey = process.env.SYSTEM_SECRET_KEY;

  if (!systemKey || systemKey !== expectedKey) {
    return res.status(401).json({ 
      error: "Неверный системный ключ",
      message: "Доступ запрещен"
    });
  }
  next();
};

// Middleware для админской авторизации (для создания пользователей)
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'] as string;
  const expectedKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ 
      error: "Неверный админский ключ",
      message: "Доступ запрещен"
    });
  }
  next();
};
