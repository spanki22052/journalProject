import { Router } from "express";
import type { Module } from "../types";
import { registerChatRoutes } from "./api/routes";

export const chatModule: Module = {
  name: "chat",
  version: "1.0.0",
  register(root: Router) {
    const r = Router();
    registerChatRoutes(r);
    root.use("/chat", r);
  },
};
