"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = exports.ChatModel = void 0;
// Простейшая модель с хранением сообщений в памяти процесса
class ChatModel {
    constructor() {
        this.messages = [];
        this.nextId = 1;
        this.maxMessages = 100;
    }
    // Вернуть копию массива сообщений
    getAll() {
        return [...this.messages];
    }
    // Добавить новое сообщение; возвращаем итоговый объект для рассылки клиентам
    add(author, text) {
        const trimmedAuthor = (author !== null && author !== void 0 ? author : "").trim() || "Anonymous";
        const trimmedText = (text !== null && text !== void 0 ? text : "").trim();
        if (!trimmedText) {
            throw new Error("Текст сообщения пуст");
        }
        const message = {
            id: this.nextId++,
            author: trimmedAuthor.slice(0, 30),
            text: trimmedText.slice(0, 500),
            timestamp: Date.now(),
        };
        this.messages.push(message);
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        return message;
    }
}
exports.ChatModel = ChatModel;
exports.chatModel = new ChatModel();
//# sourceMappingURL=chatMessage.js.map