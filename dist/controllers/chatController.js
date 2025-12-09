"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const chatMessage_1 = require("../models/chatMessage");
// Контроллер инкапсулирует работу с моделью в HTTP
class ChatController {
    constructor() {
        this.getMessages = (_req, res) => {
            const messages = chatMessage_1.chatModel.getAll();
            res.json({ messages });
        };
    }
}
exports.chatController = new ChatController();
//# sourceMappingURL=chatController.js.map