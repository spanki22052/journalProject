import type {
  ChatData,
  CreateChatData,
  ChatMessageData,
  CreateChatMessageData,
  UpdateChatMessageData,
  ChatWithMessages,
} from "./types";

export interface ChatRepository {
  create(data: CreateChatData): Promise<ChatData>;
  findByObjectId(objectId: string): Promise<ChatData | null>;
  findById(id: string): Promise<ChatData | null>;
  delete(id: string): Promise<boolean>;
}

export interface ChatMessageRepository {
  create(data: CreateChatMessageData): Promise<ChatMessageData>;
  findByChatId(chatId: string): Promise<ChatMessageData[]>;
  findById(id: string): Promise<ChatMessageData | null>;
  update(id: string, data: UpdateChatMessageData): Promise<ChatMessageData | null>;
  delete(id: string): Promise<boolean>;
}
