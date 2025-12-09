"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const chatMessage_1 = require("../models/chatMessage");
// Сервис для настройки Socket.io и обработки событий клиентов
class SocketService {
    constructor(io) {
        this.io = io;
    }
    init() {
        this.io.on("connection", (socket) => {
            console.log(`Игрок подключился: ${socket.id}`);
            // Отдаём пользователю текущую историю сообщений
            socket.emit("chat:init", chatMessage_1.chatModel.getAll());
            // Навешиваем обработчик отправки сообщений
            this.handleSendMessage(socket);
            socket.on("disconnect", () => {
                console.log(`Игрок отключился: ${socket.id}`);
            });
        });
    }
    handleSendMessage(socket) {
        socket.on("chat:send", (payload, callback) => {
            try {
                const message = chatMessage_1.chatModel.add(payload.author, payload.text);
                this.io.emit("chat:new", message);
                if (callback) {
                    callback();
                }
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : "Не удалось отправить сообщение";
                if (callback) {
                    callback(message);
                }
                else {
                    socket.emit("chat:error", message);
                }
            }
        });
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map