import { Server as SocketIOServer, Socket } from "socket.io";
import type { ChatMessageData } from "../domain/types";

export interface WebSocketService {
  sendMessageToChat(chatId: string, message: ChatMessageData): void;
  sendMessageToUser(userId: string, message: ChatMessageData): void;
  joinChat(socket: Socket, chatId: string): void;
  leaveChat(socket: Socket, chatId: string): void;
  getConnectedUsers(chatId: string): string[];
}

export class SocketIOWebSocketService implements WebSocketService {
  private io: SocketIOServer;
  private chatRooms: Map<string, Set<string>> = new Map(); // chatId -> Set of socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  sendMessageToChat(chatId: string, message: ChatMessageData): void {
    this.io.to(`chat:${chatId}`).emit("newMessage", message);
  }

  sendMessageToUser(userId: string, message: ChatMessageData): void {
    this.io.to(`user:${userId}`).emit("newMessage", message);
  }

  joinChat(socket: Socket, chatId: string): void {
    socket.join(`chat:${chatId}`);

    // Добавляем socket в комнату чата
    if (!this.chatRooms.has(chatId)) {
      this.chatRooms.set(chatId, new Set());
    }
    this.chatRooms.get(chatId)!.add(socket.id);

    // Уведомляем других участников чата
    socket.to(`chat:${chatId}`).emit("userJoined", {
      chatId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  }

  leaveChat(socket: Socket, chatId: string): void {
    socket.leave(`chat:${chatId}`);

    // Удаляем socket из комнаты чата
    const room = this.chatRooms.get(chatId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        this.chatRooms.delete(chatId);
      }
    }

    // Уведомляем других участников чата
    socket.to(`chat:${chatId}`).emit("userLeft", {
      chatId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedUsers(chatId: string): string[] {
    const room = this.chatRooms.get(chatId);
    return room ? Array.from(room) : [];
  }

  // Дополнительные методы для управления соединениями
  onConnection(socket: Socket): void {
    console.log(`Пользователь подключился: ${socket.id}`);

    // Обработка отключения
    socket.on("disconnect", () => {
      console.log(`Пользователь отключился: ${socket.id}`);
      this.handleDisconnect(socket);
    });
  }

  private handleDisconnect(socket: Socket): void {
    // Удаляем socket из всех комнат
    for (const [chatId, sockets] of this.chatRooms.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.chatRooms.delete(chatId);
        }

        // Уведомляем о выходе пользователя
        socket.to(`chat:${chatId}`).emit("userLeft", {
          chatId,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}
