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
  ChangePasswordData,
} from "./types";

export interface UserRepository {
  create(data: CreateUserData): Promise<UserData>;
  findById(id: string): Promise<UserData | null>;
  findByEmail(email: string): Promise<UserData | null>;
  findByRole(role: UserRole): Promise<UserData[]>;
  findAll(filters?: UserFilters): Promise<UserData[]>;
  update(id: string, data: UpdateUserData): Promise<UserData | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: UserFilters): Promise<number>;
}

export interface AuthRepository {
  login(data: LoginData): Promise<AuthResult | null>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  generateResetToken(): string;
  requestPasswordReset(data: PasswordResetRequest): Promise<{ token: string; expiresAt: Date } | null>;
  resetPassword(data: PasswordResetData): Promise<boolean>;
  changePassword(userId: string, data: ChangePasswordData): Promise<boolean>;
  // Session-based методы
  createSession(userId: string, userRole: string, userEmail: string, userFullName: string): void;
  destroySession(): void;
  isAuthenticated(): boolean;
  getCurrentUser(): { userId: string; userRole: string; userEmail: string; userFullName: string } | null;
}
