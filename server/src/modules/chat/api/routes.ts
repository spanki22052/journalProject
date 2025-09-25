import { Router } from "express";
import { z } from "zod";

const MessageSchema = z.object({
  text: z.string().min(1),
  userId: z.string().uuid().optional(),
});

export function registerChatRoutes(r: Router) {
  r.get("/", (_req, res) => {
    res.json({ module: "chat", ok: true });
  });

  r.post("/message", (req, res) => {
    const parsed = MessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const message = parsed.data;
    res.status(201).json({ saved: true, message });
  });
}
