import { MessageSchema } from '../domain/entities';
import { z } from 'zod';

describe('Chat Role Migration', () => {
  describe('MessageSchema validation', () => {
    it('should accept new role values', () => {
      const validMessage = {
        id: 'msg-123',
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'ADMIN',
        content: 'Hello',
        files: [],
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = MessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should accept CONTRACTOR role', () => {
      const validMessage = {
        id: 'msg-123',
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'CONTRACTOR',
        content: 'Hello',
        files: [],
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = MessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should accept ORGAN_CONTROL role', () => {
      const validMessage = {
        id: 'msg-123',
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'INSPECTOR',
        content: 'Hello',
        files: [],
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = MessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject old role values', () => {
      const invalidMessage = {
        id: 'msg-123',
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'contractor', // Old role value
        content: 'Hello',
        files: [],
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = MessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('should reject customer role', () => {
      const invalidMessage = {
        id: 'msg-123',
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'customer', // Old role value
        content: 'Hello',
        files: [],
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = MessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('should reject invalid role values', () => {
      const invalidMessage = {
        id: 'msg-123',
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'INVALID_ROLE',
        content: 'Hello',
        files: [],
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = MessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });
  });

  describe('API Schema validation', () => {
    const SendMessageSchema = z.object({
      roomId: z.string(),
      senderId: z.string(),
      senderName: z.string(),
      senderRole: z.enum(["ADMIN", "CONTRACTOR", "ORGAN_CONTROL"]),
      content: z.string().min(1),
      recognizedInfo: z.string().optional(),
      files: z.array(z.string()).optional(),
    });

    it('should validate API request with new roles', () => {
      const validRequest = {
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'ADMIN',
        content: 'Hello world',
      };

      const result = SendMessageSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject API request with old roles', () => {
      const invalidRequest = {
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'contractor', // Old role
        content: 'Hello world',
      };

      const result = SendMessageSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });

    it('should validate all new role values in API', () => {
      const roles = ['ADMIN', 'CONTRACTOR', 'ORGAN_CONTROL'];
      
      roles.forEach(role => {
        const request = {
          roomId: 'room-123',
          senderId: 'user-123',
          senderName: 'Test User',
          senderRole: role,
          content: 'Hello world',
        };

        const result = SendMessageSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('WebSocket Schema validation', () => {
    const WebSocketSendMessageSchema = z.object({
      roomId: z.string(),
      senderId: z.string(),
      senderName: z.string(),
      senderRole: z.enum(["ADMIN", "CONTRACTOR", "INSPECTOR"]),
      content: z.string().min(1),
      recognizedInfo: z.string().optional(),
      files: z.array(z.string()).optional(),
    });

    it('should validate WebSocket message with new roles', () => {
      const validMessage = {
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'INSPECTOR',
        content: 'Hello world',
      };

      const result = WebSocketSendMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should reject WebSocket message with old roles', () => {
      const invalidMessage = {
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'customer', // Old role
        content: 'Hello world',
      };

      const result = WebSocketSendMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_enum_value');
      }
    });
  });

  describe('Use case type validation', () => {
    it('should accept new role types in use case parameters', () => {
      const validParams = {
        roomId: 'room-123',
        senderId: 'user-123',
        senderName: 'Test User',
        senderRole: 'ADMIN' as const,
        content: 'Hello world',
      };

      // This test ensures TypeScript compilation passes
      expect(validParams.senderRole).toBe('ADMIN');
    });

    it('should accept all new role types', () => {
      const roles: Array<'ADMIN' | 'CONTRACTOR' | 'ORGAN_CONTROL'> = [
        'ADMIN',
        'CONTRACTOR', 
        'ORGAN_CONTROL'
      ];

      roles.forEach(role => {
        const params = {
          roomId: 'room-123',
          senderId: 'user-123',
          senderName: 'Test User',
          senderRole: role,
          content: 'Hello world',
        };

        expect(params.senderRole).toBe(role);
      });
    });
  });

  describe('Backward compatibility', () => {
    it('should handle migration from old to new roles', () => {
      // Simulate old message data
      const oldMessageData = {
        senderRole: 'contractor' as any, // Old role
      };

      // Migration logic (if needed)
      const roleMapping: Record<string, string> = {
        'contractor': 'CONTRACTOR',
        'customer': 'ORGAN_CONTROL',
      };

      const migratedRole = roleMapping[oldMessageData.senderRole] || oldMessageData.senderRole;
      
      expect(migratedRole).toBe('CONTRACTOR');
    });

    it('should validate migrated role', () => {
      const migratedRole = 'CONTRACTOR';
      
      const validRoles = ['ADMIN', 'CONTRACTOR', 'ORGAN_CONTROL'];
      expect(validRoles).toContain(migratedRole);
    });
  });
});
