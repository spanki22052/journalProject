// Типы для ролей (теперь enum)
export type UserRole = 'ADMIN' | 'CONTRACTOR' | 'ORGAN_CONTROL';

// Типы для пользователей
export interface UserData {
  id: string;
  email: string;
  password?: string; // Пароль может быть опциональным при возврате данных
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole; // По умолчанию CONTRACTOR
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  fullName?: string;
  role?: UserRole;
}

// Типы для аутентификации
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  token: string; // JWT токен
}

export interface AuthResult {
  user: UserData;
  token?: string; // JWT токен (если будет реализован)
}

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Типы для восстановления пароля
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Фильтры
export interface UserFilters {
  role?: UserRole;
  email?: string;
  fullName?: string;
}
