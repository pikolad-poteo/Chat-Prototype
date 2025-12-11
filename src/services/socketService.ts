import { Server as SocketServer, Socket } from "socket.io";
import { ChatMessage, chatModel } from "../models/chatMessage";

// Сервис для настройки Socket.io и обработки событий клиентов
export class SocketService {
  // счётчик подключённых клиентов
  private onlineCount = 0;

  constructor(private readonly io: SocketServer) {}

  public init(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Игрок подключился: ${socket.id}`);

      // увеличиваем счётчик и оповещаем всех
      this.onlineCount++;
      this.io.emit("chat:online", this.onlineCount);

      // отправляем историю сообщений только подключившемуся клиенту
      socket.emit("chat:init", chatModel.getAll());

      // обработка отправки сообщений
      this.handleSendMessage(socket);

      socket.on("disconnect", () => {
        console.log(`Игрок отключился: ${socket.id}`);
        this.onlineCount = Math.max(0, this.onlineCount - 1);
        this.io.emit("chat:online", this.onlineCount);
      });
    });
  }

  private handleSendMessage(socket: Socket): void {
    socket.on(
      "chat:send",
      (
        payload: { author: string; text: string },
        callback?: (err?: string) => void
      ) => {
        try {
          const message: ChatMessage = chatModel.add(
            payload.author,
            payload.text
          );

          // рассылаем новое сообщение всем подключённым клиентам
          this.io.emit("chat:new", message);

          if (callback) {
            callback();
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Не удалось отправить сообщение";

          if (callback) {
            callback(message);
          } else {
            socket.emit("chat:error", message);
          }
        }
      }
    );
  }
}
