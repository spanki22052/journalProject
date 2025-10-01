import type {
  UserRole,
  UserData,
  CreateUserData,
  UpdateUserData,
  LoginData,
  AuthResult,
  JwtPayload,
  UserFilters,
  PasswordResetRequest,
  PasswordResetData,
  PasswordResetToken,
} from "./types";

export interface UserRepository {
  create(data: CreateUserData): Promise<UserData>;
  findById(id: string): Promise<UserData | null>;
  findByEmail(email: string): Promise<UserData | null>;
  findAll(filters?: UserFilters): Promise<UserData[]>;
  update(id: string, data: UpdateUserData): Promise<UserData | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: UserFilters): Promise<number>;
}

export interface AuthRepository {
  login(data: LoginData): Promise<AuthResult | null>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  generateToken(userId: string, role: string): string;
  verifyToken(token: string): JwtPayload | null;
  generateResetToken(): string;
  requestPasswordReset(data: PasswordResetRequest): Promise<{ token: string; expiresAt: Date } | null>;
  resetPassword(data: PasswordResetData): Promise<boolean>;
}
