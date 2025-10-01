import { Request, Response, NextFunction } from 'express';
import type { AuthRepository } from '../domain/repository';
import type { JwtPayload } from '../domain/types';

// Расширяем интерфейс Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Мидлвар для проверки JWT токена
export const jwtAuth = (authRepository: AuthRepository) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Токен не предоставлен' });
      }

      const token = authHeader.substring(7); // Убираем "Bearer "
      const payload = authRepository.verifyToken(token);

      if (!payload) {
        return res.status(401).json({ error: 'Недействительный токен' });
      }

      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Ошибка проверки токена' });
    }
  };
};

// Мидлвар для проверки роли администратора
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен: требуется роль администратора' });
  }

  next();
};

// Мидлвар для проверки роли подрядчика
export const requireContractor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }

  if (req.user.role !== 'contractor') {
    return res.status(403).json({ error: 'Доступ запрещен: требуется роль подрядчика' });
  }

  next();
};

// Мидлвар для проверки роли органа контроля
export const requireOrganControl = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }

  if (req.user.role !== 'organ_control') {
    return res.status(403).json({ error: 'Доступ запрещен: требуется роль органа контроля' });
  }

  next();
};

// Мидлвар для проверки любой авторизованной роли
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Пользователь не авторизован' });
  }

  next();
};

// Мидлвар для проверки нескольких ролей
export const requireAnyRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Доступ запрещен: требуется одна из ролей: ${roles.join(', ')}` 
      });
    }

    next();
  };
};
