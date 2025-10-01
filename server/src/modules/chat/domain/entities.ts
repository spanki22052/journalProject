import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderRole: z.enum(["ADMIN", "CONTRACTOR", "INSPECTOR"]),
  content: z.string(),
  recognizedInfo: z.string().optional(),
  files: z.array(z.string()).default([]),
  status: z.enum(["sent", "delivered", "read"]).default("sent"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;
