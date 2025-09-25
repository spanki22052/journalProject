import { Message } from "./entities";

export interface MessageRepository {
  create(
    message: Omit<Message, "id" | "createdAt" | "updatedAt">
  ): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByRoomId(roomId: string): Promise<Message[]>;
  update(id: string, updates: Partial<Message>): Promise<Message | null>;
  delete(id: string): Promise<boolean>;
}

export interface FileStorage {
  uploadFile(
    objectName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string>;
  getFileUrl(objectName: string, expiry?: number): Promise<string>;
  deleteFile(objectName: string): Promise<void>;
}

export interface WebSocketService {
  emitToRoom(roomId: string, event: string, data: any): void;
  emitToUser(userId: string, event: string, data: any): void;
  joinRoom(userId: string, roomId: string): void;
  leaveRoom(userId: string, roomId: string): void;
}
