import request from 'supertest';
import express from 'express';
import { createAuthRoutes } from '../api/routes';
import { UserUseCases, AuthUseCases } from '../application/use-cases';
import { AuthRepository } from '../domain/repository';
import { UserData, LoginResult } from '../domain/types';

// Mock dependencies
const mockUserUseCases = {
  createUser: jest.fn(),
  createAdminUser: jest.fn(),
  createOrganControlUser: jest.fn(),
  getUserById: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
} as unknown as jest.Mocked<UserUseCases>;

const mockAuthUseCases = {
  login: jest.fn(),
} as unknown as jest.Mocked<AuthUseCases>;

const mockAuthRepository = {
  verifyToken: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
} as unknown as jest.Mocked<AuthRepository>;

// Setup Express app
const app = express();
app.use(express.json());
const router = createAuthRoutes(mockUserUseCases, mockAuthUseCases, mockAuthRepository);
app.use('/api/auth', router);

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/roles', () => {
    it('should return available roles', async () => {
      const response = await request(app)
        .get('/api/auth/roles');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        { value: "ADMIN", label: "Администратор" },
        { value: "CONTRACTOR", label: "Подрядчик" },
        { value: "ORGAN_CONTROL", label: "Орган контроля" },
      ]);
    });
  });

  describe('POST /api/auth/users', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'CONTRACTOR',
      };

      const createdUser: UserData = {
        id: 'user-123',
        email: userData.email,
        fullName: userData.fullName,
        role: 'CONTRACTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserUseCases.createUser.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/auth/users')
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        role: createdUser.role,
      });
      expect(mockUserUseCases.createUser).toHaveBeenCalledWith(userData);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        fullName: '',
      };

      const response = await request(app)
        .post('/api/auth/users')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Неверные данные');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const loginResult: LoginResult = {
        user: {
          id: 'user-123',
          email: loginData.email,
          fullName: 'Test User',
          role: 'CONTRACTOR',
        },
        token: 'jwt-token-123',
      };

      mockAuthUseCases.login.mockResolvedValue(loginResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(loginResult);
      expect(mockAuthUseCases.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      mockAuthUseCases.login.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Неверный email или пароль');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should request password reset successfully', async () => {
      const resetData = {
        email: 'user@example.com',
      };

      const resetResult = {
        token: 'reset-token-123',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };

      mockAuthRepository.requestPasswordReset.mockResolvedValue(resetResult);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(resetData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Если пользователь с таким email существует, на него будет отправлена ссылка для восстановления пароля');
      expect(mockAuthRepository.requestPasswordReset).toHaveBeenCalledWith(resetData);
    });

    it('should return success even if user does not exist', async () => {
      const resetData = {
        email: 'nonexistent@example.com',
      };

      mockAuthRepository.requestPasswordReset.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(resetData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Если пользователь с таким email существует, на него будет отправлена ссылка для восстановления пароля');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        token: 'valid-reset-token',
        newPassword: 'newpassword123',
      };

      mockAuthRepository.resetPassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Пароль успешно изменен');
      expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(resetData);
    });

    it('should return 400 for invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        newPassword: 'newpassword123',
      };

      mockAuthRepository.resetPassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Недействительный или истекший токен');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      const mockPayload = {
        userId: 'user-123',
        role: 'CONTRACTOR',
        iat: 1234567890,
        exp: 1234571490,
      };

      mockAuthRepository.verifyToken.mockReturnValue(mockPayload);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token');

      expect(response.statusCode).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.user).toEqual(mockPayload);
    });

    it('should return 401 for invalid token', async () => {
      mockAuthRepository.verifyToken.mockReturnValue(null);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Недействительный токен');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Токен не предоставлен');
    });
  });
});
