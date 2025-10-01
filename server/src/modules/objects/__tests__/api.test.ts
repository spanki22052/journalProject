import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { createObjectRoutes } from '../api/routes';
import { ObjectUseCases } from '../application/use-cases';
import { PrismaObjectRepository } from '../infrastructure/prisma-object-repository';
import { SessionAuthRepository } from '../../auth/infrastructure/session-auth-repository';
import { PrismaUserRepository } from '../../auth/infrastructure/prisma-user-repository';
import { UserUseCases, AuthUseCases } from '../../auth/application/use-cases';
import { createAuthRoutes } from '../../auth/api/routes';
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
    object: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
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

describe('Objects API Routes', () => {
  let app: express.Application;
  let mockPrisma: any;
  let objectRepository: PrismaObjectRepository;
  let objectUseCases: ObjectUseCases;
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
    objectRepository = new PrismaObjectRepository(mockPrisma);
    objectUseCases = new ObjectUseCases(objectRepository);
    userRepository = new PrismaUserRepository(mockPrisma);
    userUseCases = new UserUseCases(userRepository, null as any);

    // Настройка auth роутов
    app.use('/api/auth', (req, res, next) => {
      const authRepository = new SessionAuthRepository(mockPrisma, req, res);
      authUseCases = new AuthUseCases(userRepository, authRepository);
      const authRoutes = createAuthRoutes(userUseCases, authUseCases, authRepository, req, res);
      authRoutes(req, res, next);
    });

    // Настройка object роутов
    app.use('/api/objects', (req, res, next) => {
      const authRepository = new SessionAuthRepository(mockPrisma, req, res);
      const objectRoutes = createObjectRoutes(objectUseCases, authRepository);
      objectRoutes(req, res, next);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/objects', () => {
    const validObjectData = {
      name: 'Test Project',
      description: 'Test Description',
      type: 'PROJECT',
      assignee: 'user-123',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
      progress: 0,
      isExpanded: false,
      polygonCoords: [[55.7558, 37.6176], [55.7558, 37.6177], [55.7559, 37.6177], [55.7559, 37.6176], [55.7558, 37.6176]]
    };

    const mockCreatedObject = {
      id: 'object-123',
      name: 'Test Project',
      description: 'Test Description',
      type: 'PROJECT',
      assignee: 'user-123',
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2024-12-31T23:59:59.999Z'),
      progress: 0,
      isExpanded: false,
      polygon: 'POLYGON((37.6176 55.7558, 37.6177 55.7558, 37.6177 55.7559, 37.6176 55.7559, 37.6176 55.7558))',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create object successfully with admin role', async () => {
      // Мокаем аутентификацию
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      
      // Мокаем создание объекта
      mockPrisma.object.create.mockResolvedValue(mockCreatedObject);

      // Создаем сессию
      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(validObjectData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'object-123',
        name: 'Test Project',
        description: 'Test Description',
        type: 'PROJECT',
        assignee: 'user-123',
        progress: 0,
        isExpanded: false,
      });
      expect(mockPrisma.object.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Project',
          description: 'Test Description',
          type: 'PROJECT',
          assignee: 'user-123',
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-12-31T23:59:59.999Z'),
          progress: 0,
          isExpanded: false,
        },
      });
    });

    it('should create object successfully with contractor role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'contractor@test.com',
        password: 'hashed-password',
        role: 'CONTRACTOR',
        fullName: 'Test Contractor',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.create.mockResolvedValue(mockCreatedObject);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'contractor@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(validObjectData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'object-123',
        name: 'Test Project',
      });
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/objects')
        .send(validObjectData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for inspector role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'inspector@test.com',
        password: 'hashed-password',
        role: 'INSPECTOR',
        fullName: 'Test Inspector',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inspector@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(validObjectData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid data', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const invalidData = {
        // missing required fields
        description: 'Test Description',
      };

      const response = await request(app)
        .post('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 400 for invalid polygon coordinates', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const invalidData = {
        ...validObjectData,
        polygonCoords: [[55.7558, 37.6176], [55.7558, 37.6177]], // less than 3 points
      };

      const response = await request(app)
        .post('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
    });

    it('should return 500 for internal server error', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.create.mockRejectedValue(new Error('Database error'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(validObjectData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
    });
  });

  describe('GET /api/objects', () => {
    const mockObjects = [
      {
        id: 'object-1',
        name: 'Project 1',
        description: 'Description 1',
        type: 'PROJECT',
        assignee: 'user-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        progress: 50,
        isExpanded: true,
        polygon: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'object-2',
        name: 'Task 1',
        description: 'Description 2',
        type: 'TASK',
        assignee: 'user-2',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        progress: 25,
        isExpanded: false,
        polygon: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should get all objects successfully', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.findMany.mockResolvedValue(mockObjects);
      mockPrisma.object.count.mockResolvedValue(2);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        id: 'object-1',
        name: 'Project 1',
        type: 'PROJECT',
        progress: 50,
      });
    });

    it('should get objects with filters', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.findMany.mockResolvedValue([mockObjects[0]]);
      mockPrisma.object.count.mockResolvedValue(1);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects?type=PROJECT&assignee=user-1&search=Project&limit=10&offset=0')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('offset', 0);
      expect(mockPrisma.object.findMany).toHaveBeenCalledWith({
        where: {
          type: 'PROJECT',
          assignee: {
            contains: 'user-1',
            mode: 'insensitive',
          },
          OR: [
            { name: { contains: 'Project', mode: 'insensitive' } },
            { description: { contains: 'Project', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/objects')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid query parameters', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects?type=INVALID_TYPE')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные параметры запроса');
    });

    it('should return 500 for internal server error', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.findMany.mockRejectedValue(new Error('Database error'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
    });
  });

  describe('GET /api/objects/:id', () => {
    const mockObject = {
      id: 'object-123',
      name: 'Test Project',
      description: 'Test Description',
      type: 'PROJECT',
      assignee: 'user-123',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      progress: 50,
      isExpanded: true,
      polygon: 'POLYGON((37.6176 55.7558, 37.6177 55.7558, 37.6177 55.7559, 37.6176 55.7559, 37.6176 55.7558))',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should get object by id successfully', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.findUnique.mockResolvedValue(mockObject);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'object-123',
        name: 'Test Project',
        description: 'Test Description',
        type: 'PROJECT',
        assignee: 'user-123',
        progress: 50,
        isExpanded: true,
      });
      expect(response.body).toHaveProperty('polygonCoords');
      expect(mockPrisma.object.findUnique).toHaveBeenCalledWith({
        where: { id: 'object-123' },
      });
    });

    it('should return 404 for non-existent object', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.findUnique.mockResolvedValue(null);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects/non-existent')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Объект не найден');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/objects/object-123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 for internal server error', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.findUnique.mockRejectedValue(new Error('Database error'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
    });
  });

  describe('PUT /api/objects/:id', () => {
    const updateData = {
      name: 'Updated Project',
      description: 'Updated Description',
      progress: 75,
    };

    const mockUpdatedObject = {
      id: 'object-123',
      name: 'Updated Project',
      description: 'Updated Description',
      type: 'PROJECT',
      assignee: 'user-123',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      progress: 75,
      isExpanded: true,
      polygon: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update object successfully with admin role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.update.mockResolvedValue(mockUpdatedObject);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .put('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'object-123',
        name: 'Updated Project',
        description: 'Updated Description',
        progress: 75,
      });
      expect(mockPrisma.object.update).toHaveBeenCalledWith({
        where: { id: 'object-123' },
        data: {
          name: 'Updated Project',
          description: 'Updated Description',
          progress: 75,
        },
      });
    });

    it('should update object successfully with contractor role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'contractor@test.com',
        password: 'hashed-password',
        role: 'CONTRACTOR',
        fullName: 'Test Contractor',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.update.mockResolvedValue(mockUpdatedObject);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'contractor@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .put('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'object-123',
        name: 'Updated Project',
      });
    });

    it('should return 500 for non-existent object', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.update.mockRejectedValue(new Error('Record not found'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .put('/api/objects/non-existent')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(updateData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/objects/object-123')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for inspector role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'inspector@test.com',
        password: 'hashed-password',
        role: 'INSPECTOR',
        fullName: 'Test Inspector',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inspector@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .put('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid data', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const invalidData = {
        progress: 150, // invalid progress > 100
      };

      const response = await request(app)
        .put('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Неверные данные');
    });

    it('should return 500 for internal server error', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.update.mockRejectedValue(new Error('Database error'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .put('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .send(updateData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
    });
  });

  describe('DELETE /api/objects/:id', () => {
    it('should delete object successfully with admin role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.delete.mockResolvedValue({});

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .delete('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(204);

      expect(mockPrisma.object.delete).toHaveBeenCalledWith({
        where: { id: 'object-123' },
      });
    });

    it('should return 404 for non-existent object', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.delete.mockRejectedValue(new Error('Record not found'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .delete('/api/objects/non-existent')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Объект не найден');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete('/api/objects/object-123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for contractor role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'contractor@test.com',
        password: 'hashed-password',
        role: 'CONTRACTOR',
        fullName: 'Test Contractor',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'contractor@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .delete('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for inspector role', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'inspector@test.com',
        password: 'hashed-password',
        role: 'INSPECTOR',
        fullName: 'Test Inspector',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inspector@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .delete('/api/objects/object-123')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent object', async () => {
      const bcrypt = require('bcrypt');
      const mockUser = {
        id: 'user-123',
        email: 'admin@test.com',
        password: 'hashed-password',
        role: 'ADMIN',
        fullName: 'Test Admin',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.object.delete.mockRejectedValue(new Error('Record not found'));

      const sessionResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .delete('/api/objects/non-existent')
        .set('Cookie', sessionResponse.headers['set-cookie'])
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Объект не найден');
    });
  });
});
