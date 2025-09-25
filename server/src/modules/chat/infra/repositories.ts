import { Message } from "../domain/entities";
import { MessageRepository } from "../domain/ports";

// In-memory репозиторий для демонстрации
// В реальном проекте здесь будет подключение к БД

export class InMemoryMessageRepository implements MessageRepository {
  private messages: Map<string, Message> = new Map();

  async create(
    message: Omit<Message, "id" | "createdAt" | "updatedAt">
  ): Promise<Message> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newMessage: Message = {
      ...message,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async findById(id: string): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async findByRoomId(roomId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.roomId === roomId
    );
  }

  async update(id: string, updates: Partial<Message>): Promise<Message | null> {
    const message = this.messages.get(id);
    if (!message) return null;

    const updatedMessage = { ...message, ...updates, updatedAt: new Date() };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async delete(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }
}
