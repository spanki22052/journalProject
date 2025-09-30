import { PrismaClient } from "@prisma/client";
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
} from "../domain/types";

export class PrismaChatRepository implements ChatRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChatData): Promise<ChatData> {
    const chat = await this.prisma.chat.create({
      data: {
        objectId: data.objectId,
      },
    });

    return this.mapToChatData(chat);
  }

  async findByObjectId(objectId: string): Promise<ChatData | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { objectId },
    });

    return chat ? this.mapToChatData(chat) : null;
  }

  async findById(id: string): Promise<ChatData | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
    });

    return chat ? this.mapToChatData(chat) : null;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.chat.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Ошибка при удалении чата:", error);
      return false;
    }
  }

  private mapToChatData(chat: any): ChatData {
    return {
      id: chat.id,
      objectId: chat.objectId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}

export class PrismaChatMessageRepository implements ChatMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChatMessageData): Promise<ChatMessageData> {
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId: data.chatId,
        content: data.content,
        type: data.type || "TEXT",
        author: data.author,
        taskId: data.taskId,
        isEditSuggestion: data.isEditSuggestion || false,
        isCompletionConfirmation: data.isCompletionConfirmation || false,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      },
    });

    return this.mapToChatMessageData(message);
  }

  async findByChatId(chatId: string): Promise<ChatMessageData[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return messages.map(this.mapToChatMessageData);
  }

  async findById(id: string): Promise<ChatMessageData | null> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id },
    });

    return message ? this.mapToChatMessageData(message) : null;
  }

  async update(
    id: string,
    data: UpdateChatMessageData
  ): Promise<ChatMessageData | null> {
    const message = await this.prisma.chatMessage.update({
      where: { id },
      data: {
        ...(data.content && { content: data.content }),
        ...(data.type && { type: data.type }),
        ...(data.author && { author: data.author }),
        ...(data.taskId !== undefined && { taskId: data.taskId }),
        ...(data.isEditSuggestion !== undefined && {
          isEditSuggestion: data.isEditSuggestion,
        }),
        ...(data.isCompletionConfirmation !== undefined && {
          isCompletionConfirmation: data.isCompletionConfirmation,
        }),
      },
    });

    return this.mapToChatMessageData(message);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.chatMessage.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Ошибка при удалении сообщения:", error);
      return false;
    }
  }

  private mapToChatMessageData(message: any): ChatMessageData {
    return {
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      type: message.type,
      author: message.author,
      taskId: message.taskId,
      isEditSuggestion: message.isEditSuggestion,
      isCompletionConfirmation: message.isCompletionConfirmation,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      createdAt: message.createdAt,
    };
  }
}
