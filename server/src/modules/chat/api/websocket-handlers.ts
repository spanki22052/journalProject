import { Server as SocketIOServer } from "socket.io";
import { SendMessageUseCase } from "../application/use-cases";
import { z } from "zod";

const JoinRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string().uuid(),
});

const SendMessageSchema = z.object({
  roomId: z.string(),
  senderId: z.string().uuid(),
  senderName: z.string(),
  senderRole: z.enum(["contractor", "customer"]),
  content: z.string().min(1),
  recognizedInfo: z.string().optional(),
  files: z.array(z.string()).optional(),
});

export function setupChatWebSocketHandlers(
  io: SocketIOServer,
  sendMessageUseCase: SendMessageUseCase
) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Присоединиться к комнате
    socket.on("join_room", async (data) => {
      try {
        const parsed = JoinRoomSchema.safeParse(data);
        if (!parsed.success) {
          socket.emit("error", { message: "Invalid join data" });
          return;
        }

        const { roomId, userId } = parsed.data;
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

        const message = await sendMessageUseCase.execute(parsed.data);

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
