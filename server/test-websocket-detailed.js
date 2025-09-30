// Подробный тест WebSocket функциональности модуля chats
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

let testChatId = null;
let testMessageId = null;

socket.on("connect", () => {
  console.log("✅ Подключен к серверу:", socket.id);

  // Тест 1: Получение списка чатов
  console.log("\n📋 Тест 1: Получение списка чатов");
  socket.emit("getChats");
});

socket.on("chatsList", (data) => {
  console.log("✅ Получен список чатов:", data.chats.length, "чатов");

  if (data.chats.length > 0) {
    testChatId = data.chats[0].id;
    console.log("📝 Используем чат для тестов:", testChatId);

    // Тест 2: Подключение к чату
    console.log("\n🔗 Тест 2: Подключение к чату");
    socket.emit("joinChat", { chatId: testChatId });
  } else {
    console.log("❌ Нет чатов для тестирования");
  }
});

socket.on("joinedChat", (data) => {
  console.log("✅ Успешно подключился к чату:", data.chatId);

  // Тест 3: Отправка сообщения
  console.log("\n💬 Тест 3: Отправка сообщения");
  socket.emit("sendMessage", {
    chatId: testChatId,
    content: "Тестовое сообщение через WebSocket",
    type: "TEXT",
    author: "Test User",
  });
});

socket.on("chatHistory", (data) => {
  console.log("✅ Получена история чата:", data.messages.length, "сообщений");
});

socket.on("messageSent", (data) => {
  console.log("✅ Сообщение отправлено:", data.messageId);
  testMessageId = data.messageId;

  // Тест 4: Получение сообщений чата
  console.log("\n📨 Тест 4: Получение сообщений чата");
  socket.emit("getChatMessages", { chatId: testChatId });
});

socket.on("chatMessages", (data) => {
  console.log("✅ Получены сообщения чата:", data.messages.length, "сообщений");

  if (testMessageId) {
    // Тест 5: Обновление сообщения
    console.log("\n✏️ Тест 5: Обновление сообщения");
    socket.emit("updateMessage", {
      messageId: testMessageId,
      content: "Обновленное тестовое сообщение",
      author: "Test User Updated",
    });
  }
});

socket.on("messageUpdated", (data) => {
  console.log("✅ Сообщение обновлено:", data.messageId);

  // Тест 6: Подтверждение завершения
  console.log("\n✅ Тест 6: Подтверждение завершения");
  socket.emit("confirmCompletion", {
    messageId: testMessageId,
    isConfirmed: true,
  });
});

socket.on("completionConfirmed", (data) => {
  console.log(
    "✅ Завершение подтверждено:",
    data.messageId,
    "isConfirmed:",
    data.isConfirmed
  );

  // Тест 7: Выход из чата
  console.log("\n🚪 Тест 7: Выход из чата");
  socket.emit("leaveChat", { chatId: testChatId });
});

socket.on("leftChat", (data) => {
  console.log("✅ Успешно вышел из чата:", data.chatId);

  // Тест 8: Удаление сообщения
  if (testMessageId) {
    console.log("\n🗑️ Тест 8: Удаление сообщения");
    socket.emit("deleteMessage", { messageId: testMessageId });
  } else {
    console.log("\n✅ Все тесты завершены успешно!");
    socket.disconnect();
  }
});

socket.on("messageDeleted", (data) => {
  console.log("✅ Сообщение удалено:", data.messageId);
  console.log("\n🎉 Все тесты WebSocket завершены успешно!");
  socket.disconnect();
});

socket.on("newMessage", (message) => {
  console.log("📨 Получено новое сообщение:", message.content);
});

socket.on("userJoined", (data) => {
  console.log("👤 Пользователь присоединился:", data.socketId);
});

socket.on("userLeft", (data) => {
  console.log("👋 Пользователь покинул чат:", data.socketId);
});

socket.on("error", (error) => {
  console.error("❌ Ошибка:", error);
});

socket.on("disconnect", () => {
  console.log("🔌 Отключен от сервера");
});

// Обработка сигналов завершения
process.on("SIGINT", () => {
  console.log("\n🛑 Завершение теста...");
  socket.disconnect();
  process.exit(0);
});

console.log("🚀 Запуск подробного теста WebSocket...");
console.log("Нажмите Ctrl+C для завершения");
