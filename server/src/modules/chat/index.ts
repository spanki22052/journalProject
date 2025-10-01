import { Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import { MinioClient } from "../../infra/storage/minio-client";
import { InMemoryMessageRepository } from "./infra/repositories";
import { SocketIOWebSocketService } from "./infra/websocket-service";
import {
  SendMessageUseCase,
  GetRoomMessagesUseCase,
  UploadFileUseCase,
  GetFileUrlUseCase,
} from "./application/use-cases";
import { createChatRoutes } from "./api/routes";
import { setupChatWebSocketHandlers } from "./api/websocket-handlers";
import type { AuthRepository } from "../auth/domain/repository";

export interface ChatModuleConfig {
  minio: {
    endPoint: string;
    port?: number;
    useSSL?: boolean;
    accessKey: string;
    secretKey: string;
    bucketName: string;
  };
}

export class ChatModule {
  private messageRepo: InMemoryMessageRepository;
  private fileStorage: MinioClient;
  private wsService!: SocketIOWebSocketService;

  constructor(private config: ChatModuleConfig) {
    // Инициализируем репозиторий
    this.messageRepo = new InMemoryMessageRepository();

    // Инициализируем MinIO
    this.fileStorage = new MinioClient(this.config.minio);
  }

  async initialize(): Promise<void> {
    await this.fileStorage.initialize();
  }

  setupWebSocket(io: SocketIOServer, authRepository: AuthRepository): void {
    this.wsService = new SocketIOWebSocketService(io);
    setupChatWebSocketHandlers(io, this.createSendMessageUseCase(), authRepository);
  }

  createRoutes(authRepository: AuthRepository): Router {
    return createChatRoutes(
      this.createSendMessageUseCase(),
      this.createGetRoomMessagesUseCase(),
      this.createUploadFileUseCase(),
      this.createGetFileUrlUseCase(),
      authRepository
    );
  }

  private createSendMessageUseCase(): SendMessageUseCase {
    return new SendMessageUseCase(
      this.messageRepo,
      this.fileStorage,
      this.wsService
    );
  }

  private createGetRoomMessagesUseCase(): GetRoomMessagesUseCase {
    return new GetRoomMessagesUseCase(this.messageRepo);
  }

  private createUploadFileUseCase(): UploadFileUseCase {
    return new UploadFileUseCase(this.fileStorage);
  }

  private createGetFileUrlUseCase(): GetFileUrlUseCase {
    return new GetFileUrlUseCase(this.fileStorage);
  }
}
