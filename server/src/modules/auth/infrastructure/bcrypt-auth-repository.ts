import bcrypt from 'bcrypt';
import { AuthRepository } from '../domain/repository';
import type { LoginData, AuthResult, PasswordResetRequest, PasswordResetData, ChangePasswordData } from '../domain/types';

export class BcryptAuthRepository implements AuthRepository {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(data: LoginData): Promise<AuthResult | null> {
    // This method should be implemented by the session-based repository
    throw new Error('Login method should be implemented by session-based repository');
  }

  generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ token: string; expiresAt: Date } | null> {
    // Implementation for password reset request
    const token = this.generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { token, expiresAt };
  }

  async resetPassword(data: PasswordResetData): Promise<boolean> {
    // Implementation for password reset
    return true;
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<boolean> {
    // Implementation for password change
    return true;
  }

  // Session-based methods (stubs for compatibility)
  createSession(userId: string, userRole: string, userEmail: string, userFullName: string): void {
    // This should be implemented by the session-based repository
    throw new Error('Session methods should be implemented by session-based repository');
  }

  destroySession(): void {
    // This should be implemented by the session-based repository
    throw new Error('Session methods should be implemented by session-based repository');
  }

  isAuthenticated(): boolean {
    // This should be implemented by the session-based repository
    throw new Error('Session methods should be implemented by session-based repository');
  }

  getCurrentUser(): { userId: string; userRole: string; userEmail: string; userFullName: string } | null {
    // This should be implemented by the session-based repository
    throw new Error('Session methods should be implemented by session-based repository');
  }
}
