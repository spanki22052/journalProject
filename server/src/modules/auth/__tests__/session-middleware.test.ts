import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { 
  sessionAuth, 
  requireAdmin, 
  requireContractor, 
  requireInspector, 
  requireAnyRole 
} from '../middleware/session-auth';
import { AuthRepository } from '../domain/repository';

describe('Session Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockAuthRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    mockNext = jest.fn();
    mockAuthRepository = {
      isAuthenticated: jest.fn(),
      getCurrentUser: jest.fn(),
    } as any;
  });

  describe('sessionAuth', () => {
    it('should call next() when user is authenticated', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);

      const middleware = sessionAuth(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(false);

      const middleware = sessionAuth(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should call next() when user is admin', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'ADMIN',
        userEmail: 'admin@test.com',
        userFullName: 'Admin User',
      });

      const middleware = requireAdmin(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(false);

      const middleware = requireAdmin(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not admin', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'CONTRACTOR',
        userEmail: 'contractor@test.com',
        userFullName: 'Contractor User',
      });

      const middleware = requireAdmin(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Доступ запрещен",
        message: "Требуются права администратора"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when getCurrentUser returns null', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue(null);

      const middleware = requireAdmin(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireContractor', () => {
    it('should call next() when user is contractor', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'CONTRACTOR',
        userEmail: 'contractor@test.com',
        userFullName: 'Contractor User',
      });

      const middleware = requireContractor(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not contractor', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'ADMIN',
        userEmail: 'admin@test.com',
        userFullName: 'Admin User',
      });

      const middleware = requireContractor(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Доступ запрещен",
        message: "Требуются права подрядчика"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireInspector', () => {
    it('should call next() when user is inspector', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'INSPECTOR',
        userEmail: 'inspector@test.com',
        userFullName: 'Inspector User',
      });

      const middleware = requireInspector(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not inspector', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'ADMIN',
        userEmail: 'admin@test.com',
        userFullName: 'Admin User',
      });

      const middleware = requireInspector(mockAuthRepository);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Доступ запрещен",
        message: "Требуются права инспектора"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAnyRole', () => {
    it('should call next() when user is authenticated with allowed role', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'ADMIN',
        userEmail: 'admin@test.com',
        userFullName: 'Admin User'
      });

      const middleware = requireAnyRole(mockAuthRepository)('ADMIN', 'CONTRACTOR');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(false);

      const middleware = requireAnyRole(mockAuthRepository)('ADMIN', 'CONTRACTOR');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Требуется авторизация",
        message: "Пользователь не авторизован"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not allowed', () => {
      mockAuthRepository.isAuthenticated.mockReturnValue(true);
      mockAuthRepository.getCurrentUser.mockReturnValue({
        userId: 'user-123',
        userRole: 'INSPECTOR',
        userEmail: 'inspector@test.com',
        userFullName: 'Inspector User'
      });

      const middleware = requireAnyRole(mockAuthRepository)('ADMIN', 'CONTRACTOR');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Доступ запрещен",
        message: "Требуется одна из ролей: ADMIN, CONTRACTOR"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
