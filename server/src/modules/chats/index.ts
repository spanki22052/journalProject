import { Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { PrismaChatRepository, PrismaChatMessageRepository } from "./infrastructure/prisma-chat-repository.js";
import { ChatUseCases } from "./application/use-cases.js";
import { createChatRoutes } from "./api/routes.js";
import { setupChatsWebSocketHandlers } from "./api/websocket-handlers.js";
import { SocketIOWebSocketService } from "./infrastructure/websocket-service.js";

export interface ChatsModuleConfig {
  prisma: PrismaClient;
}

export class ChatsModule {
  private chatRepository: PrismaChatRepository;
  private chatMessageRepository: PrismaChatMessageRepository;
  private chatUseCases: ChatUseCases;
  private wsService?: SocketIOWebSocketService;

  constructor(private config: ChatsModuleConfig) {
    // Инициализируем репозитории
    this.chatRepository = new PrismaChatRepository(this.config.prisma);
    this.chatMessageRepository = new PrismaChatMessageRepository(this.config.prisma);
    
    // Инициализируем use cases без WebSocket сервиса
    this.chatUseCases = new ChatUseCases(
      this.chatRepository,
      this.chatMessageRepository
    );
  }

  async initialize(): Promise<void> {
    // Инициализация модуля (если нужна)
    console.log("Chats module initialized");
  }

  setupWebSocket(io: SocketIOServer): void {
    // Создаем WebSocket сервис
    this.wsService = new SocketIOWebSocketService(io);
    
    // Обновляем use cases с WebSocket сервисом
    this.chatUseCases = new ChatUseCases(
      this.chatRepository,
      this.chatMessageRepository,
      this.wsService
    );
    
    // Настраиваем WebSocket обработчики
    setupChatsWebSocketHandlers(io, this.chatUseCases, this.wsService);
    
    console.log("Chats WebSocket handlers configured");
  }

  createRoutes(): Router {
    return createChatRoutes(this.chatUseCases);
  }

  // Геттеры для доступа к сервисам
  getChatUseCases(): ChatUseCases {
    return this.chatUseCases;
  }

  getWebSocketService(): SocketIOWebSocketService | undefined {
    return this.wsService;
  }
}
