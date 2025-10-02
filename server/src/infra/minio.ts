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
        console.log(`✅ Bucket ${this.bucketName} created successfully`);
      } else {
        console.log(`✅ Bucket ${this.bucketName} already exists`);
      }
      
      // Ensure bucket policy is public (this is a fallback, Docker Compose should handle this)
      try {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`]
            },
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:PutObject", "s3:DeleteObject"],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`]
            }
          ]
        };
        
        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`✅ Public access policy applied to ${this.bucketName}`);
      } catch (policyError) {
        console.warn(`⚠️ Could not set bucket policy (this is usually handled by Docker Compose):`, policyError);
      }
      
    } catch (error) {
      console.error("❌ Error initializing MinIO:", error);
      throw error;
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    try {
      const objectName = `${Date.now()}-${fileName}`;

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
      // Полностью публичный доступ без аутентификации
      // Use environment variable for public URL, fallback to localhost
      const publicUrl = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';
      return `${publicUrl}/${this.bucketName}/${objectName}`;
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
