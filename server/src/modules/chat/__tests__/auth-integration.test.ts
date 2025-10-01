import request from 'supertest';
import express from 'express';
import { createChatRoutes } from '../api/routes';
import { SendMessageUseCase, GetRoomMessagesUseCase, UploadFileUseCase, GetFileUrlUseCase } from '../application/use-cases';
import { AuthRepository } from '../../auth/domain/repository';
import { JwtPayload } from '../../auth/domain/types';

// Mock dependencies
const mockSendMessageUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<SendMessageUseCase>;

const mockGetRoomMessagesUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<GetRoomMessagesUseCase>;

const mockUploadFileUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<UploadFileUseCase>;

const mockGetFileUrlUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<GetFileUrlUseCase>;

const mockAuthRepository = {
  verifyToken: jest.fn(),
} as unknown as jest.Mocked<AuthRepository>;

// Setup Express app
const app = express();
app.use(express.json());
const router = createChatRoutes(
  mockSendMessageUseCase,
  mockGetRoomMessagesUseCase,
  mockUploadFileUseCase,
  mockGetFileUrlUseCase,
  mockAuthRepository
);
app.use('/api/chat', router);

describe('Chat Auth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Authentication', () => {
    const validToken = 'valid-jwt-token';
    const invalidToken = 'invalid-jwt-token';
    const mockUser: JwtPayload = {
      userId: 'user-123',
      role: 'CONTRACTOR',
      iat: 1234567890,
      exp: 1234571490,
    };

    describe('GET /api/chat/rooms/:roomId/messages', () => {
      it('should allow access with valid JWT token', async () => {
        const roomId = 'room-123';
        const mockMessages = [
          {
            id: 'msg-1',
            roomId,
            senderId: 'user-123',
            senderName: 'Test User',
            senderRole: 'CONTRACTOR' as const,
            content: 'Hello',
            files: [],
            status: 'sent' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockAuthRepository.verifyToken.mockReturnValue(mockUser);
        mockGetRoomMessagesUseCase.execute.mockResolvedValue(mockMessages);

        const response = await request(app)
          .get(`/api/chat/rooms/${roomId}/messages`)
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.messages).toMatchObject([
          {
            id: mockMessages[0].id,
            roomId: mockMessages[0].roomId,
            senderId: mockMessages[0].senderId,
            senderName: mockMessages[0].senderName,
            senderRole: mockMessages[0].senderRole,
            content: mockMessages[0].content,
            files: mockMessages[0].files,
            status: mockMessages[0].status,
          }
        ]);
        expect(mockAuthRepository.verifyToken).toHaveBeenCalledWith(validToken);
        expect(mockGetRoomMessagesUseCase.execute).toHaveBeenCalledWith(roomId);
      });

      it('should deny access without JWT token', async () => {
        const roomId = 'room-123';

        const response = await request(app)
          .get(`/api/chat/rooms/${roomId}/messages`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Токен не предоставлен');
        expect(mockGetRoomMessagesUseCase.execute).not.toHaveBeenCalled();
      });

      it('should deny access with invalid JWT token', async () => {
        const roomId = 'room-123';

        mockAuthRepository.verifyToken.mockReturnValue(null);

        const response = await request(app)
          .get(`/api/chat/rooms/${roomId}/messages`)
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Недействительный токен');
        expect(mockGetRoomMessagesUseCase.execute).not.toHaveBeenCalled();
      });
    });

    describe('POST /api/chat/messages', () => {
      it('should send message with valid JWT token and extract user info', async () => {
        const messageData = {
          roomId: 'room-123',
          senderId: 'user-123',
          senderName: 'Test User',
          senderRole: 'CONTRACTOR',
          content: 'Hello world',
        };

        const expectedMessage = {
          id: 'msg-123',
          roomId: messageData.roomId,
          senderId: mockUser.userId,
          senderName: messageData.senderName,
          senderRole: mockUser.role as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL",
          content: messageData.content,
          files: [],
          status: 'sent' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockAuthRepository.verifyToken.mockReturnValue(mockUser);
        mockSendMessageUseCase.execute.mockResolvedValue(expectedMessage);

        const response = await request(app)
          .post('/api/chat/messages')
          .set('Authorization', `Bearer ${validToken}`)
          .send(messageData);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toMatchObject({
          id: expectedMessage.id,
          roomId: expectedMessage.roomId,
          senderId: expectedMessage.senderId,
          senderName: expectedMessage.senderName,
          senderRole: expectedMessage.senderRole,
          content: expectedMessage.content,
          files: expectedMessage.files,
          status: expectedMessage.status,
        });
        expect(mockSendMessageUseCase.execute).toHaveBeenCalledWith({
          ...messageData,
          senderId: mockUser.userId,
          senderRole: mockUser.role as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL",
        });
      });

      it('should deny message sending without JWT token', async () => {
        const messageData = {
          roomId: 'room-123',
          senderName: 'Test User',
          content: 'Hello world',
        };

        const response = await request(app)
          .post('/api/chat/messages')
          .send(messageData);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Токен не предоставлен');
        expect(mockSendMessageUseCase.execute).not.toHaveBeenCalled();
      });

      it('should use provided senderId and senderRole if JWT is missing them', async () => {
        const messageData = {
          roomId: 'room-123',
          senderId: 'custom-user-id',
          senderName: 'Test User',
          senderRole: 'ADMIN',
          content: 'Hello world',
        };

        const mockUserWithoutRole: JwtPayload = {
          userId: 'user-123',
          role: 'CONTRACTOR',
        };

        const expectedMessage = {
          id: 'msg-123',
          roomId: messageData.roomId,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          senderRole: messageData.senderRole as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL",
          content: messageData.content,
          files: [],
          status: 'sent' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockAuthRepository.verifyToken.mockReturnValue(mockUserWithoutRole);
        mockSendMessageUseCase.execute.mockResolvedValue(expectedMessage);

        const response = await request(app)
          .post('/api/chat/messages')
          .set('Authorization', `Bearer ${validToken}`)
          .send(messageData);

        expect(response.statusCode).toBe(201);
        expect(mockSendMessageUseCase.execute).toHaveBeenCalledWith({
          ...messageData,
          senderId: mockUserWithoutRole.userId,
          senderRole: mockUserWithoutRole.role,
        });
      });
    });

    describe('POST /api/chat/upload', () => {
      it('should allow file upload with valid JWT token', async () => {
        const mockFile = {
          buffer: Buffer.from('test file content'),
          originalname: 'test.txt',
          mimetype: 'text/plain',
        };

        mockAuthRepository.verifyToken.mockReturnValue(mockUser);
        mockUploadFileUseCase.execute.mockResolvedValue('chat/test-file.txt');

        const response = await request(app)
          .post('/api/chat/upload')
          .set('Authorization', `Bearer ${validToken}`)
          .attach('file', mockFile.buffer, mockFile.originalname);

        expect(response.statusCode).toBe(200);
        expect(response.body.filePath).toBe('chat/test-file.txt');
        expect(mockUploadFileUseCase.execute).toHaveBeenCalledWith(
          mockFile.buffer,
          mockFile.originalname,
          mockFile.mimetype
        );
      });

      it('should deny file upload without JWT token', async () => {
        const response = await request(app)
          .post('/api/chat/upload');

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Токен не предоставлен');
        expect(mockUploadFileUseCase.execute).not.toHaveBeenCalled();
      });
    });

    describe('GET /api/chat/files/:filePath', () => {
      it('should allow file URL access with valid JWT token', async () => {
        const filePath = 'chat/test-file.txt';
        const mockUrl = 'https://storage.example.com/chat/test-file.txt';

        mockAuthRepository.verifyToken.mockReturnValue(mockUser);
        mockGetFileUrlUseCase.execute.mockResolvedValue(mockUrl);

        const response = await request(app)
          .get(`/api/chat/files/${encodeURIComponent(filePath)}`)
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.url).toBe(mockUrl);
        expect(mockGetFileUrlUseCase.execute).toHaveBeenCalledWith(filePath);
      });

      it('should deny file URL access without JWT token', async () => {
        const filePath = 'chat/test-file.txt';

        const response = await request(app)
          .get(`/api/chat/files/${encodeURIComponent(filePath)}`);

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Токен не предоставлен');
        expect(mockGetFileUrlUseCase.execute).not.toHaveBeenCalled();
      });
    });
  });

  describe('Role-based access', () => {
    const validToken = 'valid-jwt-token';

    it('should work with ADMIN role', async () => {
      const adminUser: JwtPayload = {
        userId: 'admin-123',
        role: 'ADMIN',
      };

      const messageData = {
        roomId: 'room-123',
        senderId: 'admin-123',
        senderName: 'Admin User',
        senderRole: 'ADMIN',
        content: 'Admin message',
      };

        const expectedMessage = {
          id: 'msg-123',
          roomId: messageData.roomId,
          senderId: adminUser.userId,
          senderName: messageData.senderName,
          senderRole: adminUser.role as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL",
          content: messageData.content,
          files: [],
          status: 'sent' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

      mockAuthRepository.verifyToken.mockReturnValue(adminUser);
      mockSendMessageUseCase.execute.mockResolvedValue(expectedMessage);

      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${validToken}`)
        .send(messageData);

      expect(response.statusCode).toBe(201);
      expect(mockSendMessageUseCase.execute).toHaveBeenCalledWith({
        ...messageData,
        senderId: adminUser.userId,
        senderRole: adminUser.role,
      });
    });

    it('should work with ORGAN_CONTROL role', async () => {
      const organUser: JwtPayload = {
        userId: 'organ-123',
        role: 'ORGAN_CONTROL',
      };

      const messageData = {
        roomId: 'room-123',
        senderId: 'organ-123',
        senderName: 'Organ User',
        senderRole: 'ORGAN_CONTROL',
        content: 'Organ message',
      };

        const expectedMessage = {
          id: 'msg-123',
          roomId: messageData.roomId,
          senderId: organUser.userId,
          senderName: messageData.senderName,
          senderRole: organUser.role as "ADMIN" | "CONTRACTOR" | "ORGAN_CONTROL",
          content: messageData.content,
          files: [],
          status: 'sent' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

      mockAuthRepository.verifyToken.mockReturnValue(organUser);
      mockSendMessageUseCase.execute.mockResolvedValue(expectedMessage);

      const response = await request(app)
        .post('/api/chat/messages')
        .set('Authorization', `Bearer ${validToken}`)
        .send(messageData);

      expect(response.statusCode).toBe(201);
      expect(mockSendMessageUseCase.execute).toHaveBeenCalledWith({
        ...messageData,
        senderId: organUser.userId,
        senderRole: organUser.role,
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/chat/rooms/room-123/messages')
        .set('Authorization', 'InvalidFormat token');

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Токен не предоставлен');
    });

    it('should handle missing Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/chat/rooms/room-123/messages')
        .set('Authorization', 'some-token');

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('Токен не предоставлен');
    });

    it('should handle use case errors', async () => {
      const validToken = 'valid-jwt-token';
      const mockUser: JwtPayload = {
        userId: 'user-123',
        role: 'CONTRACTOR',
      };

      mockAuthRepository.verifyToken.mockReturnValue(mockUser);
      mockGetRoomMessagesUseCase.execute.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/chat/rooms/room-123/messages')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('Failed to get messages');
    });
  });
});
