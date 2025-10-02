import type {
  UserRepository,
  AuthRepository,
} from "../domain/repository";
import type {
  UserRole,
  UserData,
  CreateUserData,
  UpdateUserData,
  LoginData,
  LoginResult,
  AuthResult,
  UserFilters,
} from "../domain/types";

export class UserUseCases {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository
  ) {}

  private async checkUniqueRole(role: UserRole, roleName: string): Promise<void> {
    const existingUser = await this.userRepository.findAll({ role });
    if (existingUser.length > 0) {
      throw new Error(`Пользователь с ролью "${roleName}" уже существует`);
    }
  }

  async createUser(data: CreateUserData): Promise<UserData> {
    // Проверяем, что пользователь с таким email не существует
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(`Пользователь с email "${data.email}" уже существует`);
    }

    // Хешируем пароль
    const hashedPassword = await this.authRepository.hashPassword(data.password);

    return this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role || 'CONTRACTOR', // По умолчанию CONTRACTOR
    });
  }

  async createAdminUser(data: CreateUserData): Promise<UserData> {
    // Проверяем, что админ еще не создан
    await this.checkUniqueRole('ADMIN', 'admin');

    return this.createUser({
      ...data,
      role: 'ADMIN',
    });
  }

  async createInspectorUser(data: CreateUserData): Promise<UserData> {
    // Проверяем, что инспектор еще не создан
    await this.checkUniqueRole('INSPECTOR', 'inspector');

    return this.createUser({
      ...data,
      role: 'INSPECTOR',
    });
  }

  async getUserById(id: string): Promise<UserData | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    return this.userRepository.findByEmail(email);
  }

  async getAllUsers(filters?: UserFilters): Promise<UserData[]> {
    return this.userRepository.findAll(filters);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<UserData | null> {
    // Проверяем, что пользователь существует
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error(`Пользователь с ID "${id}" не найден`);
    }

    // Если меняется email, проверяем уникальность
    if (data.email && data.email !== existingUser.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(data.email);
      if (userWithSameEmail) {
        throw new Error(`Пользователь с email "${data.email}" уже существует`);
      }
    }

    // Если меняется пароль, хешируем его
    if (data.password) {
      data.password = await this.authRepository.hashPassword(data.password);
    }

    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    // Проверяем, что пользователь существует
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error(`Пользователь с ID "${id}" не найден`);
    }

    return this.userRepository.delete(id);
  }

  async getUsersCount(filters?: UserFilters): Promise<number> {
    return this.userRepository.count(filters);
  }

  async getContractors(): Promise<{ id: string; fullName: string }[]> {
    const contractors = await this.userRepository.findByRole('CONTRACTOR');
    return contractors.map(contractor => ({
      id: contractor.id,
      fullName: contractor.fullName
    }));
  }
}

export class AuthUseCases {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository
  ) {}

  async login(data: LoginData): Promise<LoginResult | null> {
    // Находим пользователя по email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.password) {
      return null;
    }

    // Проверяем пароль
    const isValidPassword = await this.authRepository.validatePassword(
      data.password,
      user.password
    );

    if (!isValidPassword) {
      return null;
    }

    // Создаем сессию
    this.authRepository.createSession(
      user.id,
      user.role,
      user.email,
      user.fullName
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      token: 'session-based', // Заглушка для совместимости
    };
  }
}
