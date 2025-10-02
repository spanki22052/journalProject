import { Request, Response, NextFunction } from 'express';

export interface AdminAuthRequest extends Request {
  adminKey?: string;
}

export const adminAuth = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'] as string;
  
  if (!adminKey) {
    return res.status(401).json({ 
      error: 'Отсутствует ключ администратора',
      message: 'Требуется заголовок X-Admin-Key'
    });
  }

  const validAdminKey = process.env.ADMIN_SECRET_KEY;
  
  if (!validAdminKey) {
    console.error('ADMIN_SECRET_KEY не установлен в переменных окружения');
    return res.status(500).json({ 
      error: 'Ошибка конфигурации сервера' 
    });
  }

  if (adminKey !== validAdminKey) {
    return res.status(403).json({ 
      error: 'Неверный ключ администратора',
      message: 'Доступ запрещен'
    });
  }

  req.adminKey = adminKey;
  next();
};

export const systemAuth = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  const systemKey = req.headers['x-system-key'] as string;
  
  if (!systemKey) {
    return res.status(401).json({ 
      error: 'Отсутствует системный ключ',
      message: 'Требуется заголовок X-System-Key'
    });
  }

  const validSystemKey = process.env.SYSTEM_SECRET_KEY;
  
  if (!validSystemKey) {
    console.error('SYSTEM_SECRET_KEY не установлен в переменных окружения');
    return res.status(500).json({ 
      error: 'Ошибка конфигурации сервера' 
    });
  }

  if (systemKey !== validSystemKey) {
    return res.status(403).json({ 
      error: 'Неверный системный ключ',
      message: 'Доступ запрещен'
    });
  }

  req.adminKey = systemKey;
  next();
};
