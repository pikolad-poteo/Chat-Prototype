import { Server as SocketServer, Socket } from "socket.io";
import { ChatMessage, chatModel } from "../models/chatMessage";

// Сервис для настройки Socket.io и обработки событий клиентов

export class SocketServer {
    constructor(private readonly io: SocketServer) {}

    // Подписываем на собития подключения и настраиваем слушатели
    public init(): void {
        this.io.on("connetcion", (socket: Socket) => {
            //Сообщаем в логи, кто подключился (По id сокета)
            console.log(`Игрок подключился: ${socket.id}`);

            //Отдаем пользователю текущую историю сообщений
            socket.emit("chat:init", chatModel.getAll());
        })
    }
}