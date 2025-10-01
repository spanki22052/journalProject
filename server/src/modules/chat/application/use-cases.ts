import { Message } from "../domain/entities";
import {
  MessageRepository,
  FileStorage,
  WebSocketService,
} from "../domain/ports";

export class SendMessageUseCase {
  constructor(
    private messageRepo: MessageRepository,
    private fileStorage: FileStorage,
    private wsService: WebSocketService
  ) {}

  async execute(params: {
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: "ADMIN" | "CONTRACTOR" | "INSPECTOR";
    content: string;
    recognizedInfo?: string;
    files?: string[];
  }): Promise<Message> {
    const message: Omit<Message, "id" | "createdAt" | "updatedAt"> = {
      roomId: params.roomId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      content: params.content,
      recognizedInfo: params.recognizedInfo,
      files: params.files || [],
      status: "sent",
    };

    const createdMessage = await this.messageRepo.create(message);

    // Отправляем через WebSocket
    this.wsService.emitToRoom(params.roomId, "new_message", createdMessage);

    return createdMessage;
  }
}

export class GetRoomMessagesUseCase {
  constructor(private messageRepo: MessageRepository) {}

  async execute(roomId: string): Promise<Message[]> {
    return await this.messageRepo.findByRoomId(roomId);
  }
}

export class UploadFileUseCase {
  constructor(private fileStorage: FileStorage) {}

  async execute(
    fileBuffer: Buffer,
    originalName: string,
    contentType: string
  ): Promise<string> {
    const objectName = `chat/${crypto.randomUUID()}_${originalName}`;
    return await this.fileStorage.uploadFile(
      objectName,
      fileBuffer,
      contentType
    );
  }
}

export class GetFileUrlUseCase {
  constructor(private fileStorage: FileStorage) {}

  async execute(filePath: string, expiry?: number): Promise<string> {
    return await this.fileStorage.getFileUrl(filePath, expiry);
  }
}
