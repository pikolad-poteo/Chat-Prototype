import { Router } from "express";
import { chatController } from "../controllers/chatController";

const router = Router();

// REST-эндпоинт для истории сообщений
router.get("/api/messages", chatController.getMessages);

export default router;
