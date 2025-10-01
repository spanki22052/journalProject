import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import type { AuthRepository } from "../domain/repository";
import type { LoginData, AuthResult, JwtPayload, PasswordResetRequest, PasswordResetData } from "../domain/types";

export class BcryptAuthRepository implements AuthRepository {
  private readonly saltRounds = 12;
  private readonly jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
  private readonly resetTokenExpiresIn = 15 * 60 * 1000; // 15 минут

  constructor(private prisma: PrismaClient) {}

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

  generateToken(userId: string, role: string): string {
    try {
      const payload = { userId, role };
      const options: SignOptions = { expiresIn: "1h" };
      return jwt.sign(payload, this.jwtSecret, options);
    } catch (error) {
      throw new Error("Failed to generate token");
    }
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
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
}
