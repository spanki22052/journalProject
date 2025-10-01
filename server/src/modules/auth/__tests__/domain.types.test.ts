import { UserRole, UserData, CreateUserData, LoginData, LoginResult, JwtPayload } from '../domain/types';

describe('Auth Domain Types', () => {
  describe('UserRole', () => {
    it('should accept valid role values', () => {
      const adminRole: UserRole = 'ADMIN';
      const contractorRole: UserRole = 'CONTRACTOR';
      const organControlRole: UserRole = 'ORGAN_CONTROL';

      expect(adminRole).toBe('ADMIN');
      expect(contractorRole).toBe('CONTRACTOR');
      expect(organControlRole).toBe('ORGAN_CONTROL');
    });
  });

  describe('UserData', () => {
    it('should create a user data object', () => {
      const userData: UserData = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'CONTRACTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(userData.id).toBe('user-123');
      expect(userData.email).toBe('test@example.com');
      expect(userData.fullName).toBe('Test User');
      expect(userData.role).toBe('CONTRACTOR');
    });

    it('should allow optional password field', () => {
      const userData: UserData = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        fullName: 'Test User',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(userData.password).toBe('hashed-password');
    });
  });

  describe('CreateUserData', () => {
    it('should create user creation data', () => {
      const createData: CreateUserData = {
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
        role: 'CONTRACTOR',
      };

      expect(createData.email).toBe('new@example.com');
      expect(createData.password).toBe('password123');
      expect(createData.fullName).toBe('New User');
      expect(createData.role).toBe('CONTRACTOR');
    });

    it('should allow optional role field', () => {
      const createData: CreateUserData = {
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      };

      expect(createData.role).toBeUndefined();
    });
  });

  describe('LoginData', () => {
    it('should create login data', () => {
      const loginData: LoginData = {
        email: 'user@example.com',
        password: 'password123',
      };

      expect(loginData.email).toBe('user@example.com');
      expect(loginData.password).toBe('password123');
    });
  });

  describe('LoginResult', () => {
    it('should create login result', () => {
      const loginResult: LoginResult = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          fullName: 'Test User',
          role: 'CONTRACTOR',
        },
        token: 'jwt-token-123',
      };

      expect(loginResult.user.id).toBe('user-123');
      expect(loginResult.user.email).toBe('user@example.com');
      expect(loginResult.user.fullName).toBe('Test User');
      expect(loginResult.user.role).toBe('CONTRACTOR');
      expect(loginResult.token).toBe('jwt-token-123');
    });
  });

  describe('JwtPayload', () => {
    it('should create JWT payload', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        role: 'ADMIN',
        iat: 1234567890,
        exp: 1234571490,
      };

      expect(payload.userId).toBe('user-123');
      expect(payload.role).toBe('ADMIN');
      expect(payload.iat).toBe(1234567890);
      expect(payload.exp).toBe(1234571490);
    });

    it('should allow optional timestamp fields', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        role: 'ORGAN_CONTROL',
      };

      expect(payload.userId).toBe('user-123');
      expect(payload.role).toBe('ORGAN_CONTROL');
      expect(payload.iat).toBeUndefined();
      expect(payload.exp).toBeUndefined();
    });
  });
});
