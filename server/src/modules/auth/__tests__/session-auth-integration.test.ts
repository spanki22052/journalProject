import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { createAuthRoutes } from '../api/routes';
import { UserUseCases } from '../application/use-cases';
import { AuthUseCases } from '../application/use-cases';
import { SessionAuthRepository } from '../infrastructure/session-auth-repository';
import { PrismaUserRepository } from '../infrastructure/prisma-user-repository';
import { PrismaClient } from '@prisma/client';

// Расширяем типы для тестов
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userRole?: string;
    userEmail?: string;
    userFullName?: string;
  }
}

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    passwordResetToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('Session Auth Integration Tests', () => {
  let app: express.Application;
  let mockPrisma: any;
  let userRepository: PrismaUserRepository;
  let userUseCases: UserUseCases;
  let authUseCases: AuthUseCases;

  beforeEach(() => {
    app = express();
    
    // Настройка сессий для тестов
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    }));

    app.use(express.json());

    mockPrisma = new PrismaClient();
    userRepository = new PrismaUserRepository(mockPrisma);
    userUseCases = new UserUseCases(userRepository, null as any);

    // Настройка auth роутов
    app.use('/api/auth', (req, res, next) => {
      const authRepository = new SessionAuthRepository(mockPrisma, req, res);
      authUseCases = new AuthUseCases(userRepository, authRepository);
      const authRoutes = createAuthRoutes(userUseCases, authUseCases, authRepository, req, res);
      authRoutes(req, res, next);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and create session', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token', 'session-based');
      expect(response.body.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
        mustChangePassword: mockUser.mustChangePassword,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const bcrypt = require('bcrypt');
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for wrong password', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrong-password',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should return user data when session exists', async () => {
      // Сначала логинимся
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(loginResponse.status).toBe(200);

      // Теперь проверяем сессию
      const verifyResponse = await request(app)
        .get('/api/auth/verify')
        .set('Cookie', loginResponse.headers['set-cookie']);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body).toHaveProperty('valid', true);
      expect(verifyResponse.body).toHaveProperty('user');
    });

    it('should return 401 when no session exists', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error', 'Сессия не найдена');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user data when authenticated', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Cookie', loginResponse.headers['set-cookie']);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
        mustChangePassword: mockUser.mustChangePassword,
        createdAt: mockUser.createdAt.toISOString(),
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Пользователь не авторизован');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', loginResponse.headers['set-cookie']);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body).toHaveProperty('message', 'Выход выполнен успешно');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('new-hashed-password');
      mockPrisma.user.update.mockResolvedValue({});

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const changePasswordResponse = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', loginResponse.headers['set-cookie'])
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        });

      expect(changePasswordResponse.status).toBe(200);
      expect(changePasswordResponse.body).toHaveProperty('message', 'Пароль успешно изменен');
    });

    it('should return 400 for wrong current password', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        fullName: 'Test Admin',
        role: 'ADMIN',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      // Мокаем bcrypt.compare для логина
      bcrypt.compare.mockResolvedValueOnce(true);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      // Мокаем bcrypt.compare для проверки текущего пароля (второй вызов)
      bcrypt.compare.mockResolvedValueOnce(false);

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[] | undefined;
      const changePasswordResponse = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', cookies || [])
        .send({
          currentPassword: 'wrong-password',
          newPassword: 'newpassword123',
        });

      expect(changePasswordResponse.status).toBe(400);
      expect(changePasswordResponse.body).toHaveProperty('error', 'Неверный текущий пароль');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Пользователь не авторизован');
    });
  });
});
