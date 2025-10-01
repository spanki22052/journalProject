import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { loadConfig } from '../config/env.js';

const config = loadConfig();

// Создаем Redis клиент
const redisClient = createClient({
  url: config.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Подключаемся к Redis
redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

// Настройка сессий
export const sessionConfig = session({
  store: new RedisStore({ client: redisClient }),
  secret: config.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production', // HTTPS в продакшене
    httpOnly: true, // Защита от XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    sameSite: 'lax' // Защита от CSRF (lax для разработки)
  },
  name: 'sessionId' // Имя cookie
});

// Типы для расширения SessionData
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userRole?: string;
    userEmail?: string;
    userFullName?: string;
  }
}

export { redisClient };
