import { Router } from "express";

export interface Module {
  name: string;
  version: string;
  register: (root: Router) => void;
}
