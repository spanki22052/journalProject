import { Client } from "minio";
import { z } from "zod";

const MinioConfigSchema = z.object({
  endPoint: z.string(),
  port: z.number().optional(),
  useSSL: z.boolean().optional(),
  accessKey: z.string(),
  secretKey: z.string(),
  bucketName: z.string().default("chat-files"),
});

export type MinioConfig = z.infer<typeof MinioConfigSchema>;

export class MinioClient {
  private client: Client;
  private bucketName: string;

  constructor(config: MinioConfig) {
    const validatedConfig = MinioConfigSchema.parse(config);
    this.client = new Client({
      endPoint: validatedConfig.endPoint,
      port: validatedConfig.port,
      useSSL: validatedConfig.useSSL,
      accessKey: validatedConfig.accessKey,
      secretKey: validatedConfig.secretKey,
    });
    this.bucketName = validatedConfig.bucketName;
  }

  async initialize(): Promise<void> {
    const bucketExists = await this.client.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName, "us-east-1");
    }
  }

  async uploadFile(
    objectName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    await this.client.putObject(this.bucketName, objectName, fileBuffer, {
      "Content-Type": contentType,
    });
    return `${this.bucketName}/${objectName}`;
  }

  async getFileUrl(
    objectName: string,
    expiry: number = 7 * 24 * 60 * 60
  ): Promise<string> {
    return await this.client.presignedGetObject(
      this.bucketName,
      objectName,
      expiry
    );
  }

  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucketName, objectName);
  }
}
