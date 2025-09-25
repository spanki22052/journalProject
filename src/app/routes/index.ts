import { Router } from "express";
import { registerModules } from "../../modules";

const router = Router();

registerModules(router);

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
