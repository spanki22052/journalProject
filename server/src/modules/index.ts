import { Router } from "express";
import type { Module } from "./types";
import { chatModule } from "./chat";

const modules: Module[] = [chatModule];

export function registerModules(root: Router) {
  for (const m of modules) {
    m.register(root);
  }
}
