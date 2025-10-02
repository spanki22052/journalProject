import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z
    .string()
    .default("3003")
    .transform((v) => parseInt(v, 10)),

  // Database
  DATABASE_URL: z.string().default("postgresql://hakaton_user:hakaton_password@localhost:5433/hakaton_db"),

  // Security Keys
  ADMIN_SECRET_KEY: z.string().default("your-admin-secret-key-here"),
  SYSTEM_SECRET_KEY: z.string().default("your-system-secret-key-here"),

  // Super Admin
  SUPER_ADMIN_PASSWORD: z.string().default("SuperAdmin123!"),

  // Session Configuration
  SESSION_SECRET: z.string().default("your-super-secret-session-key"),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Frontend URL
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // MinIO конфигурация
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z
    .string()
    .default("9000")
    .transform((v) => parseInt(v, 10)),
  MINIO_USE_SSL: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),
  MINIO_SECRET_KEY: z.string().default("minioadmin"),
  MINIO_BUCKET_NAME: z.string().default("chat-files"),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): AppConfig {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
