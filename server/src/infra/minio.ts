import { Client } from "minio";

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "chat-files";

export class MinIOService {
  private client: Client;
  private bucketName: string;

  constructor() {
    this.client = minioClient;
    this.bucketName = BUCKET_NAME;
  }

  async initialize(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, "us-east-1");
        console.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      console.error("Error initializing MinIO:", error);
      throw error;
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    try {
      const objectName = `chat-files/${Date.now()}-${fileName}`;

      await this.client.putObject(
        this.bucketName,
        objectName,
        file,
        file.length,
        {
          "Content-Type": contentType,
        }
      );

      return objectName;
    } catch (error) {
      console.error("Error uploading file to MinIO:", error);
      throw error;
    }
  }

  async getFileUrl(objectName: string): Promise<string> {
    try {
      // Поскольку bucket публичный, используем прямой URL вместо подписанного
      const baseUrl = `http://localhost:9000`;
      return `${baseUrl}/${this.bucketName}/${objectName}`;
    } catch (error) {
      console.error("Error getting file URL from MinIO:", error);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error("Error deleting file from MinIO:", error);
      throw error;
    }
  }
}

export const minioService = new MinIOService();
