import { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod";
import type { ChatUseCases } from "../application/use-cases";
import type { WebSocketService } from "../infrastructure/websocket-service";

// Схемы валидации для WebSocket событий
const joinChatSchema = z.object({
  chatId: z.string().min(1),
});

const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]).default("TEXT"),
  author: z.string().min(1),
  taskId: z.string().optional(),
  isEditSuggestion: z.boolean().optional(),
  isCompletionConfirmation: z.boolean().optional(),
});

const updateMessageSchema = z.object({
  messageId: z.string().min(1),
  content: z.string().min(1).optional(),
  type: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"]).optional(),
  author: z.string().min(1).optional(),
  taskId: z.string().optional(),
  isEditSuggestion: z.boolean().optional(),
  isCompletionConfirmation: z.boolean().optional(),
});

const deleteMessageSchema = z.object({
  messageId: z.string().min(1),
});

const confirmCompletionSchema = z.object({
  messageId: z.string().min(1),
  isConfirmed: z.boolean(),
});

export function setupChatsWebSocketHandlers(
  io: SocketIOServer,
  chatUseCases: ChatUseCases,
  wsService: WebSocketService
): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Пользователь подключился к чатам: ${socket.id}`);

    // Обработка подключения к чату
    socket.on("joinChat", async (data) => {
      try {
        const { chatId } = joinChatSchema.parse(data);

        // Проверяем существование чата
        const chat = await chatUseCases.getChatById(chatId);
        if (!chat) {
          socket.emit("error", { message: "Чат не найден" });
          return;
        }

        // Подключаем пользователя к чату
        wsService.joinChat(socket, chatId);
        socket.emit("joinedChat", { chatId });

        // Отправляем историю сообщений
        const messages = await chatUseCases.getChatMessages(chatId);
        socket.emit("chatHistory", { chatId, messages });
      } catch (error) {
        console.error("Ошибка при подключении к чату:", error);
        if (error instanceof z.ZodError) {
          socket.emit("error", {
            message: "Ошибка валидации",
            details: error.errors,
          });
        } else {
          socket.emit("error", { message: "Внутренняя ошибка сервера" });
        }
      }
    });

    // Обработка выхода из чата
    socket.on("leaveChat", (data) => {
      try {
        const { chatId } = joinChatSchema.parse(data);
        wsService.leaveChat(socket, chatId);
        socket.emit("leftChat", { chatId });
      } catch (error) {
        console.error("Ошибка при выходе из чата:", error);
        socket.emit("error", { message: "Ошибка при выходе из чата" });
      }
    });

    // Обработка отправки сообщения
    socket.on("sendMessage", async (data) => {
      try {
        const validatedData = sendMessageSchema.parse(data);
        const { chatId, ...messageData } = validatedData;

        // Создаем сообщение через use case
        const message = await chatUseCases.createMessage({
          chatId,
          ...messageData,
        });

        // Отправляем сообщение всем участникам чата
        wsService.sendMessageToChat(chatId, message);

        // Подтверждаем отправку отправителю
        socket.emit("messageSent", { messageId: message.id });
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        if (error instanceof z.ZodError) {
          socket.emit("error", {
            message: "Ошибка валидации",
            details: error.errors,
          });
        } else {
          socket.emit("error", { message: "Ошибка при отправке сообщения" });
        }
      }
    });

    // Обработка обновления сообщения
    socket.on("updateMessage", async (data) => {
      try {
        const validatedData = updateMessageSchema.parse(data);
        const { messageId, ...updateData } = validatedData;

        // Обновляем сообщение через use case
        const updatedMessage = await chatUseCases.updateMessage(
          messageId,
          updateData
        );

        if (updatedMessage) {
          // Отправляем обновленное сообщение всем участникам чата
          wsService.sendMessageToChat(updatedMessage.chatId, updatedMessage);
          socket.emit("messageUpdated", { messageId: updatedMessage.id });
        } else {
          socket.emit("error", { message: "Сообщение не найдено" });
        }
      } catch (error) {
        console.error("Ошибка при обновлении сообщения:", error);
        if (error instanceof z.ZodError) {
          socket.emit("error", {
            message: "Ошибка валидации",
            details: error.errors,
          });
        } else {
          socket.emit("error", { message: "Ошибка при обновлении сообщения" });
        }
      }
    });

    // Обработка удаления сообщения
    socket.on("deleteMessage", async (data) => {
      try {
        const { messageId } = deleteMessageSchema.parse(data);

        // Получаем сообщение перед удалением для отправки уведомления
        const message = await chatUseCases.getMessageById(messageId);
        if (!message) {
          socket.emit("error", { message: "Сообщение не найдено" });
          return;
        }

        // Удаляем сообщение через use case
        const success = await chatUseCases.deleteMessage(messageId);

        if (success) {
          // Уведомляем всех участников чата об удалении
          io.to(`chat:${message.chatId}`).emit("messageDeleted", {
            messageId,
            chatId: message.chatId,
          });
          socket.emit("messageDeleted", { messageId });
        } else {
          socket.emit("error", { message: "Ошибка при удалении сообщения" });
        }
      } catch (error) {
        console.error("Ошибка при удалении сообщения:", error);
        if (error instanceof z.ZodError) {
          socket.emit("error", {
            message: "Ошибка валидации",
            details: error.errors,
          });
        } else {
          socket.emit("error", { message: "Ошибка при удалении сообщения" });
        }
      }
    });

    // Обработка подтверждения завершения
    socket.on("confirmCompletion", async (data) => {
      try {
        const { messageId, isConfirmed } = confirmCompletionSchema.parse(data);

        // Обновляем статус подтверждения через use case
        const updatedMessage = await chatUseCases.confirmCompletion(
          messageId,
          isConfirmed
        );

        if (updatedMessage) {
          // Отправляем обновленное сообщение всем участникам чата
          wsService.sendMessageToChat(updatedMessage.chatId, updatedMessage);
          socket.emit("completionConfirmed", {
            messageId: updatedMessage.id,
            isConfirmed,
          });
        } else {
          socket.emit("error", { message: "Сообщение не найдено" });
        }
      } catch (error) {
        console.error("Ошибка при подтверждении завершения:", error);
        if (error instanceof z.ZodError) {
          socket.emit("error", {
            message: "Ошибка валидации",
            details: error.errors,
          });
        } else {
          socket.emit("error", {
            message: "Ошибка при подтверждении завершения",
          });
        }
      }
    });

    // Обработка получения списка чатов
    socket.on("getChats", async () => {
      try {
        const chats = await chatUseCases.getAllChats();
        socket.emit("chatsList", { chats });
      } catch (error) {
        console.error("Ошибка при получении списка чатов:", error);
        socket.emit("error", { message: "Ошибка при получении списка чатов" });
      }
    });

    // Обработка получения сообщений чата
    socket.on("getChatMessages", async (data) => {
      try {
        const { chatId } = joinChatSchema.parse(data);
        const messages = await chatUseCases.getChatMessages(chatId);
        socket.emit("chatMessages", { chatId, messages });
      } catch (error) {
        console.error("Ошибка при получении сообщений чата:", error);
        if (error instanceof z.ZodError) {
          socket.emit("error", {
            message: "Ошибка валидации",
            details: error.errors,
          });
        } else {
          socket.emit("error", {
            message: "Ошибка при получении сообщений чата",
          });
        }
      }
    });

    // Обработка отключения
    socket.on("disconnect", () => {
      console.log(`Пользователь отключился от чатов: ${socket.id}`);
    });
  });
}
