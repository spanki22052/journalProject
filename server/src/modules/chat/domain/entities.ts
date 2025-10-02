import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderRole: z.enum(['ADMIN', 'CONTRACTOR', 'INSPECTOR']),
  content: z.string(),
  files: z.array(z.string()).default([]),
  status: z.enum(['sent', 'delivered', 'read']).default('sent'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  participants: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;
