import { Request, Response } from 'express';
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import type { AuthRepository } from "../domain/repository";
import type { LoginData, AuthResult, PasswordResetRequest, PasswordResetData, ChangePasswordData } from "../domain/types";

export class SessionAuthRepository implements AuthRepository {
  private readonly saltRounds = 12;
  private readonly resetTokenExpiresIn = 15 * 60 * 1000; // 15 минут

  constructor(
    private prisma: PrismaClient,
    private req: Request,
    private res: Response
  ) {}

  async login(data: LoginData): Promise<AuthResult | null> {
    // Этот метод не используется напрямую, так как логика входа
    // обрабатывается в AuthUseCases через UserRepository
    throw new Error("Use AuthUseCases.login() instead");
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error("Failed to hash password");
    }
  }

  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ token: string; expiresAt: Date } | null> {
    try {
      // Находим пользователя по email
      const user = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        return null; // Не раскрываем, что пользователь не существует
      }

      // Удаляем старые токены сброса пароля
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });

      // Генерируем новый токен
      const token = this.generateResetToken();
      const expiresAt = new Date(Date.now() + this.resetTokenExpiresIn);

      // Сохраняем токен в базе данных
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt
        }
      });

      return { token, expiresAt };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return null;
    }
  }

  async resetPassword(data: PasswordResetData): Promise<boolean> {
    try {
      // Находим токен сброса пароля
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token: data.token },
        include: { user: true }
      });

      if (!resetToken) {
        return false;
      }

      // Проверяем, не истек ли токен
      if (resetToken.expiresAt < new Date()) {
        // Удаляем истекший токен
        await this.prisma.passwordResetToken.delete({
          where: { id: resetToken.id }
        });
        return false;
      }

      // Хешируем новый пароль
      const hashedPassword = await this.hashPassword(data.newPassword);

      // Обновляем пароль пользователя
      await this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      });

      // Удаляем использованный токен
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<boolean> {
    try {
      // Находим пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return false;
      }

      // Проверяем текущий пароль
      const isValidPassword = await this.validatePassword(data.currentPassword, user.password);
      if (!isValidPassword) {
        return false;
      }

      // Хешируем новый пароль
      const hashedPassword = await this.hashPassword(data.newPassword);

      // Обновляем пароль и снимаем флаг принудительной смены
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          mustChangePassword: false
        }
      });

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  // Session-based методы
  createSession(userId: string, userRole: string, userEmail: string, userFullName: string): void {
    this.req.session.userId = userId;
    this.req.session.userRole = userRole;
    this.req.session.userEmail = userEmail;
    this.req.session.userFullName = userFullName;
    
    // Сохраняем сессию в Redis
    this.req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
      }
    });
  }

  destroySession(): void {
    this.req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!(this.req.session.userId && this.req.session.userRole);
  }

  getCurrentUser(): { userId: string; userRole: string; userEmail: string; userFullName: string } | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      userId: this.req.session.userId!,
      userRole: this.req.session.userRole!,
      userEmail: this.req.session.userEmail!,
      userFullName: this.req.session.userFullName!
    };
  }
}
