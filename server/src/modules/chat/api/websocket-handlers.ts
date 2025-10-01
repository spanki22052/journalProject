import { Server as SocketIOServer } from "socket.io";
import { SendMessageUseCase } from "../application/use-cases";
import { z } from "zod";
import type { AuthRepository } from "../../auth/domain/repository";
import { PrismaClient } from "@prisma/client";

const JoinRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const SendMessageSchema = z.object({
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderRole: z.enum(["ADMIN", "CONTRACTOR", "INSPECTOR"]),
  content: z.string().min(1),
  recognizedInfo: z.string().optional(),
  files: z.array(z.string()).optional(),
});

export function setupChatWebSocketHandlers(
  io: SocketIOServer,
  sendMessageUseCase: SendMessageUseCase,
  prisma: PrismaClient
) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Middleware для проверки сессии
    socket.use(async (packet, next) => {
      try {
        const sessionId = socket.handshake.auth?.sessionId;
        if (!sessionId) {
          return next(new Error("Authentication error: No session provided"));
        }

        // Проверяем сессию в Redis через Prisma
        // Для WebSocket мы не можем использовать req/res напрямую
        // Поэтому проверяем сессию через переданный sessionId
        const userData = socket.handshake.auth?.user;
        if (!userData || !userData.userId || !userData.userRole) {
          return next(new Error("Authentication error: Invalid user data"));
        }

        // Дополнительная проверка: убеждаемся, что пользователь существует
        const user = await prisma.user.findUnique({
          where: { id: userData.userId },
          select: { id: true, email: true, role: true, fullName: true }
        });

        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        // Проверяем, что роль совпадает
        if (user.role !== userData.userRole) {
          return next(new Error("Authentication error: Role mismatch"));
        }

        // Добавляем информацию о пользователе в socket
        socket.data.user = {
          userId: user.id,
          userRole: user.role,
          userEmail: user.email,
          userFullName: user.fullName
        };
        next();
      } catch (error) {
        next(new Error("Authentication error: Session validation failed"));
      }
    });

    // Присоединиться к комнате
    socket.on("join_room", async (data) => {
      try {
        const parsed = JoinRoomSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid join data" });
          return;
        }

        const { roomId, userId } = parsed.data;
        
        // Проверяем, что пользователь может присоединиться к комнате
        if (socket.data.user?.userId !== userId) {
          socket.emit("error", { message: "Unauthorized: User ID mismatch" });
          return;
        }

        socket.join(roomId);
        socket.join(`user_${userId}`);

        socket.emit("joined_room", { roomId, userId });
        console.log(`User ${userId} joined room ${roomId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Отправить сообщение
    socket.on("send_message", async (data) => {
      try {
        const parsed = SendMessageSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        // Добавляем информацию о пользователе из сессии
        const messageData = {
          ...parsed.data,
          senderId: socket.data.user?.userId || parsed.data.senderId,
          senderRole: (socket.data.user?.userRole as "ADMIN" | "CONTRACTOR" | "INSPECTOR") || parsed.data.senderRole,
        };

        const message = await sendMessageUseCase.execute(messageData);

        // Отправляем сообщение всем в комнате
        io.to(parsed.data.roomId).emit("new_message", message);

        socket.emit("message_sent", { messageId: message.id });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Покинуть комнату
    socket.on("leave_room", (data) => {
      try {
        const parsed = JoinRoomSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid leave data" });
          return;
        }

        const { roomId, userId } = parsed.data;
        socket.leave(roomId);

        socket.emit("left_room", { roomId, userId });
        console.log(`User ${userId} left room ${roomId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to leave room" });
      }
    });

    // Обработка отключения
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
