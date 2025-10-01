import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { SessionAuthRepository } from '../infrastructure/session-auth-repository';
import { Request, Response } from 'express';

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
      update: jest.fn(),
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

describe('SessionAuthRepository', () => {
  let authRepository: SessionAuthRepository;
  let mockPrisma: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      session: {
        userId: undefined,
        userRole: undefined,
        userEmail: undefined,
        userFullName: undefined,
        destroy: jest.fn(),
      } as any,
    };
    mockRes = {};

    authRepository = new SessionAuthRepository(
      mockPrisma,
      mockReq as Request,
      mockRes as Response
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create session with user data', () => {
      const userId = 'user-123';
      const userRole = 'ADMIN';
      const userEmail = 'admin@test.com';
      const userFullName = 'Test Admin';

      authRepository.createSession(userId, userRole, userEmail, userFullName);

      expect(mockReq.session!.userId).toBe(userId);
      expect(mockReq.session!.userRole).toBe(userRole);
      expect(mockReq.session!.userEmail).toBe(userEmail);
      expect(mockReq.session!.userFullName).toBe(userFullName);
    });
  });

  describe('destroySession', () => {
    it('should destroy session', () => {
      authRepository.destroySession();

      expect(mockReq.session!.destroy).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      mockReq.session!.userId = 'user-123';
      mockReq.session!.userRole = 'ADMIN';

      const result = authRepository.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      mockReq.session!.userId = undefined;
      mockReq.session!.userRole = undefined;

      const result = authRepository.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when only userId is present', () => {
      mockReq.session!.userId = 'user-123';
      mockReq.session!.userRole = undefined;

      const result = authRepository.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when only userRole is present', () => {
      mockReq.session!.userId = undefined;
      mockReq.session!.userRole = 'ADMIN';

      const result = authRepository.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', () => {
      const userId = 'user-123';
      const userRole = 'ADMIN';
      const userEmail = 'admin@test.com';
      const userFullName = 'Test Admin';

      mockReq.session!.userId = userId;
      mockReq.session!.userRole = userRole;
      mockReq.session!.userEmail = userEmail;
      mockReq.session!.userFullName = userFullName;

      const result = authRepository.getCurrentUser();

      expect(result).toEqual({
        userId,
        userRole,
        userEmail,
        userFullName,
      });
    });

    it('should return null when not authenticated', () => {
      mockReq.session!.userId = undefined;
      mockReq.session!.userRole = undefined;

      const result = authRepository.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      const result = await authRepository.validatePassword('password', 'hash');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash');
    });

    it('should return false for invalid password', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);

      const result = await authRepository.validatePassword('wrong', 'hash');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockRejectedValue(new Error('bcrypt error'));

      const result = await authRepository.validatePassword('password', 'hash');

      expect(result).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const bcrypt = require('bcrypt');
      const hashedPassword = 'hashed-password';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await authRepository.hashPassword('password');

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 12);
    });

    it('should throw error on hash failure', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockRejectedValue(new Error('hash error'));

      await expect(authRepository.hashPassword('password')).rejects.toThrow('Failed to hash password');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const bcrypt = require('bcrypt');
      const userId = 'user-123';
      const currentPassword = 'current';
      const newPassword = 'new';
      const hashedNewPassword = 'hashed-new';

      const mockUser = {
        id: userId,
        password: 'current-hash',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue(hashedNewPassword);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await authRepository.changePassword(userId, {
        currentPassword,
        newPassword,
      });

      expect(result).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          mustChangePassword: false,
        },
      });
    });

    it('should return false for invalid current password', async () => {
      const bcrypt = require('bcrypt');
      const userId = 'user-123';
      const mockUser = { id: userId, password: 'current-hash' };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const result = await authRepository.changePassword(userId, {
        currentPassword: 'wrong',
        newPassword: 'new',
      });

      expect(result).toBe(false);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should return false when user not found', async () => {
      const userId = 'user-123';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await authRepository.changePassword(userId, {
        currentPassword: 'current',
        newPassword: 'new',
      });

      expect(result).toBe(false);
    });
  });
});
