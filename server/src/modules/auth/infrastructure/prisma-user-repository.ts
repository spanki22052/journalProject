import { PrismaClient } from "@prisma/client";
import type { UserRepository } from "../domain/repository";
import type {
  UserData,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from "../domain/types";

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserData): Promise<UserData> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role || 'CONTRACTOR',
      },
    });

    return this.mapToUserData(user);
  }

  async findById(id: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToUserData(user) : null;
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToUserData(user) : null;
  }

  async findAll(filters?: UserFilters): Promise<UserData[]> {
    const users = await this.prisma.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role }),
        ...(filters?.email && {
          email: {
            contains: filters.email,
            mode: "insensitive",
          },
        }),
        ...(filters?.fullName && {
          fullName: {
            contains: filters.fullName,
            mode: "insensitive",
          },
        }),
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return users.map((user) => this.mapToUserData(user));
  }

  async update(id: string, data: UpdateUserData): Promise<UserData | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.password && { password: data.password }),
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.role && { role: data.role }),
        },
      });

      return this.mapToUserData(user);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filters?: UserFilters): Promise<number> {
    return this.prisma.user.count({
      where: {
        ...(filters?.role && { role: filters.role }),
        ...(filters?.email && {
          email: {
            contains: filters.email,
            mode: "insensitive",
          },
        }),
        ...(filters?.fullName && {
          fullName: {
            contains: filters.fullName,
            mode: "insensitive",
          },
        }),
      },
    });
  }

  private mapToUserData(user: any): UserData {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
