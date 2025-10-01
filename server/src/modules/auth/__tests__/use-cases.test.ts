import { UserUseCases, AuthUseCases } from '../application/use-cases';
import { UserRepository, AuthRepository } from '../domain/repository';
import { UserData, CreateUserData, LoginData, LoginResult, UserRole } from '../domain/types';

describe('Auth Use Cases', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let userUseCases: UserUseCases;
  let authUseCases: AuthUseCases;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    mockAuthRepository = {
      login: jest.fn(),
      validatePassword: jest.fn(),
      hashPassword: jest.fn(),
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateResetToken: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
    };

    userUseCases = new UserUseCases(mockUserRepository, mockAuthRepository);
    authUseCases = new AuthUseCases(mockUserRepository, mockAuthRepository);
  });

  describe('UserUseCases', () => {
    describe('createUser', () => {
      it('should create a user successfully', async () => {
        const createData: CreateUserData = {
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
          role: 'CONTRACTOR',
        };

        const hashedPassword = 'hashed-password-123';
        const createdUser: UserData = {
          id: 'user-123',
          email: createData.email,
          fullName: createData.fullName,
          role: createData.role || 'CONTRACTOR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockAuthRepository.hashPassword.mockResolvedValue(hashedPassword);
        mockUserRepository.create.mockResolvedValue(createdUser);

        const result = await userUseCases.createUser(createData);

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createData.email);
        expect(mockAuthRepository.hashPassword).toHaveBeenCalledWith(createData.password);
        expect(mockUserRepository.create).toHaveBeenCalledWith({
          ...createData,
          password: hashedPassword,
          role: 'CONTRACTOR',
        });
        expect(result).toEqual(createdUser);
      });

      it('should throw error if user already exists', async () => {
        const createData: CreateUserData = {
          email: 'existing@example.com',
          password: 'password123',
          fullName: 'Test User',
        };

        const existingUser: UserData = {
          id: 'user-123',
          email: createData.email,
          fullName: 'Existing User',
          role: 'CONTRACTOR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserRepository.findByEmail.mockResolvedValue(existingUser);

        await expect(userUseCases.createUser(createData)).rejects.toThrow(
          'Пользователь с email "existing@example.com" уже существует'
        );
      });

      it('should default role to CONTRACTOR if not provided', async () => {
        const createData: CreateUserData = {
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        };

        const hashedPassword = 'hashed-password-123';
        const createdUser: UserData = {
          id: 'user-123',
          email: createData.email,
          fullName: createData.fullName,
          role: 'CONTRACTOR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockAuthRepository.hashPassword.mockResolvedValue(hashedPassword);
        mockUserRepository.create.mockResolvedValue(createdUser);

        await userUseCases.createUser(createData);

        expect(mockUserRepository.create).toHaveBeenCalledWith({
          ...createData,
          password: hashedPassword,
          role: 'CONTRACTOR',
        });
      });
    });

    describe('createAdminUser', () => {
      it('should create admin user successfully', async () => {
        const createData: CreateUserData = {
          email: 'admin@example.com',
          password: 'admin123',
          fullName: 'Admin User',
        };

        const hashedPassword = 'hashed-admin-password';
        const createdUser: UserData = {
          id: 'admin-123',
          email: createData.email,
          fullName: createData.fullName,
          role: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserRepository.findAll.mockResolvedValue([]); // No existing admin
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockAuthRepository.hashPassword.mockResolvedValue(hashedPassword);
        mockUserRepository.create.mockResolvedValue(createdUser);

        const result = await userUseCases.createAdminUser(createData);

        expect(mockUserRepository.findAll).toHaveBeenCalledWith({ role: 'ADMIN' });
        expect(mockUserRepository.create).toHaveBeenCalledWith({
          ...createData,
          password: hashedPassword,
          role: 'ADMIN',
        });
        expect(result).toEqual(createdUser);
      });

      it('should throw error if admin already exists', async () => {
        const createData: CreateUserData = {
          email: 'admin@example.com',
          password: 'admin123',
          fullName: 'Admin User',
        };

        const existingAdmin: UserData = {
          id: 'admin-123',
          email: 'existing@example.com',
          fullName: 'Existing Admin',
          role: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserRepository.findAll.mockResolvedValue([existingAdmin]);

        await expect(userUseCases.createAdminUser(createData)).rejects.toThrow(
          'Пользователь с ролью "admin" уже существует'
        );
      });
    });
  });

  describe('AuthUseCases', () => {
    describe('login', () => {
      it('should login user successfully', async () => {
        const loginData: LoginData = {
          email: 'user@example.com',
          password: 'password123',
        };

        const user: UserData = {
          id: 'user-123',
          email: loginData.email,
          password: 'hashed-password',
          fullName: 'Test User',
          role: 'CONTRACTOR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const token = 'jwt-token-123';
        const expectedResult: LoginResult = {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          token,
        };

        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockAuthRepository.validatePassword.mockResolvedValue(true);
        mockAuthRepository.generateToken.mockReturnValue(token);

        const result = await authUseCases.login(loginData);

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
        expect(mockAuthRepository.validatePassword).toHaveBeenCalledWith(
          loginData.password,
          user.password
        );
        expect(mockAuthRepository.generateToken).toHaveBeenCalledWith(user.id, user.role);
        expect(result).toEqual(expectedResult);
      });

      it('should return null for invalid credentials', async () => {
        const loginData: LoginData = {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);

        const result = await authUseCases.login(loginData);

        expect(result).toBeNull();
      });

      it('should return null for wrong password', async () => {
        const loginData: LoginData = {
          email: 'user@example.com',
          password: 'wrongpassword',
        };

        const user: UserData = {
          id: 'user-123',
          email: loginData.email,
          password: 'hashed-password',
          fullName: 'Test User',
          role: 'CONTRACTOR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockAuthRepository.validatePassword.mockResolvedValue(false);

        const result = await authUseCases.login(loginData);

        expect(result).toBeNull();
      });
    });
  });
});
