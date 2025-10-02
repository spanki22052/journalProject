import type {
  ChatRepository,
  ChatMessageRepository,
} from "../domain/repository";
import type {
  ChatData,
  CreateChatData,
  ChatMessageData,
  CreateChatMessageData,
  UpdateChatMessageData,
  ChatWithMessages,
  EditSuggestionData,
  CompletionConfirmationData,
} from "../domain/types";
import type { WebSocketService } from "../infrastructure/websocket-service";
import { prisma } from "../../../infra/prisma.js";
import { ChecklistUseCases } from "../../checklists/application/use-cases.js";
import {
  PrismaChecklistRepository,
  PrismaChecklistItemRepository,
} from "../../checklists/infrastructure/prisma-checklist-repository.js";

export class ChatUseCases {
  private checklistUseCases: ChecklistUseCases;

  constructor(
    private chatRepository: ChatRepository,
    private chatMessageRepository: ChatMessageRepository,
    private wsService?: WebSocketService
  ) {
    // Инициализируем use cases для чеклистов
    const checklistRepository = new PrismaChecklistRepository(prisma);
    const checklistItemRepository = new PrismaChecklistItemRepository(prisma);
    this.checklistUseCases = new ChecklistUseCases(
      checklistRepository,
      checklistItemRepository
    );
  }

  async createChat(data: CreateChatData): Promise<ChatData> {
    return await this.chatRepository.create(data);
  }

  async getChatByObjectId(objectId: string): Promise<ChatWithMessages | null> {
    const chat = await this.chatRepository.findByObjectId(objectId);
    if (!chat) {
      return null;
    }

    const messages = await this.chatMessageRepository.findByChatId(chat.id);

    return {
      ...chat,
      messages,
    };
  }

  async getOrCreateChatByObjectId(objectId: string): Promise<ChatWithMessages> {
    let chat = await this.chatRepository.findByObjectId(objectId);

    if (!chat) {
      chat = await this.chatRepository.create({ objectId });
    }

    const messages = await this.chatMessageRepository.findByChatId(chat.id);

    return {
      ...chat,
      messages,
    };
  }

  async getAllChats(currentUser?: { id: string; userRole: string }): Promise<
    Array<ChatWithMessages & { objectName: string; unreadCount: number }>
  > {
    // Фильтруем чаты по роли пользователя
    let whereClause = {};
    if (currentUser) {
      if (currentUser.userRole === 'CONTRACTOR') {
        // Контрактор видит только чаты от объектов, где он назначен исполнителем
        whereClause = {
          object: {
            assignee: currentUser.id,
          },
        };
      }
      // INSPECTOR и ADMIN видят все чаты (без фильтра)
    }

    const chats = await prisma.chat.findMany({
      where: whereClause,
      include: {
        object: {
          select: {
            name: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats.map((chat) => ({
      id: chat.id,
      objectId: chat.objectId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        type: msg.type,
        author: msg.author,
        taskId: msg.taskId || undefined,
        isEditSuggestion: msg.isEditSuggestion,
        isCompletionConfirmation: msg.isCompletionConfirmation,
        fileUrl: msg.fileUrl || undefined,
        fileName: msg.fileName || undefined,
        fileSize: msg.fileSize || undefined,
        createdAt: msg.createdAt,
      })),
      objectName: chat.object.name,
      unreadCount: chat.messages.filter(
        (msg) => !msg.isEditSuggestion && !msg.isCompletionConfirmation
      ).length,
    }));
  }

  async createMessage(data: CreateChatMessageData): Promise<ChatMessageData> {
    const message = await this.chatMessageRepository.create(data);

    // Обновляем время последнего обновления чата
    await prisma.chat.update({
      where: { id: data.chatId },
      data: { updatedAt: new Date() },
    });

    // Отправляем сообщение через WebSocket, если сервис доступен
    if (this.wsService) {
      this.wsService.sendMessageToChat(data.chatId, message);
    }

    return message;
  }

  async getMessagesByChatId(chatId: string): Promise<ChatMessageData[]> {
    return await this.chatMessageRepository.findByChatId(chatId);
  }

  async updateMessage(
    id: string,
    data: UpdateChatMessageData
  ): Promise<ChatMessageData | null> {
    const message = await this.chatMessageRepository.update(id, data);

    // Отправляем обновленное сообщение через WebSocket, если сервис доступен
    if (message && this.wsService) {
      this.wsService.sendMessageToChat(message.chatId, message);
    }

    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return await this.chatMessageRepository.delete(id);
  }

  async suggestEdit(
    chatId: string,
    data: EditSuggestionData
  ): Promise<ChatMessageData> {
    return await this.chatMessageRepository.create({
      chatId,
      content: data.content,
      author: data.author,
      taskId: data.taskId,
      isEditSuggestion: true,
      type: "TEXT",
    });
  }

  async createCompletionConfirmation(
    chatId: string,
    data: CompletionConfirmationData
  ): Promise<ChatMessageData> {
    console.log("Creating message with data:", {
      chatId,
      content: data.content,
      author: data.author,
      taskId: data.taskId,
      isCompletionConfirmation: true,
      type: data.type || "TEXT",
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    });

    const message = await this.chatMessageRepository.create({
      chatId,
      content: data.content,
      author: data.author,
      taskId: data.taskId,
      isCompletionConfirmation: true,
      type: data.type || "TEXT",
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    });

    // Если указана задача, обновляем её статус на "выполнено" через ChecklistUseCases
    if (data.taskId) {
      await this.checklistUseCases.updateChecklistItem(data.taskId, {
        completed: true,
        completedAt: new Date(),
      });
    }

    return message;
  }

  async deleteChat(id: string): Promise<boolean> {
    return await this.chatRepository.delete(id);
  }

  // Новые методы для WebSocket поддержки
  async getChatById(chatId: string): Promise<ChatData | null> {
    return await this.chatRepository.findById(chatId);
  }

  async getChatMessages(chatId: string): Promise<ChatMessageData[]> {
    return await this.chatMessageRepository.findByChatId(chatId);
  }

  async getMessageById(messageId: string): Promise<ChatMessageData | null> {
    return await this.chatMessageRepository.findById(messageId);
  }

  async confirmCompletion(
    messageId: string,
    isConfirmed: boolean
  ): Promise<ChatMessageData | null> {
    const message = await this.chatMessageRepository.findById(messageId);
    if (!message) {
      return null;
    }

    const updatedMessage = await this.chatMessageRepository.update(messageId, {
      isCompletionConfirmation: isConfirmed,
    });

    // Если указана задача, обновляем её статус через ChecklistUseCases
    if (message.taskId) {
      await this.checklistUseCases.updateChecklistItem(message.taskId, {
        completed: isConfirmed,
        completedAt: isConfirmed ? new Date() : undefined,
      });
    }

    // Отправляем обновленное сообщение через WebSocket, если сервис доступен
    if (updatedMessage && this.wsService) {
      this.wsService.sendMessageToChat(updatedMessage.chatId, updatedMessage);
    }

    return updatedMessage;
  }
}
