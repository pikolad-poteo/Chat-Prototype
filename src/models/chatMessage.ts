export interface ChatMessage {
  id: number;
  author: string;
  text: string;
  timestamp: number;
}

// Простейшая модель с хранением сообщений в памяти процесса
export class ChatModel {
  private messages: ChatMessage[] = [];
  private nextId = 1;
  private readonly maxMessages = 100;

  // Вернуть копию массива сообщений
  public getAll(): ChatMessage[] {
    return [...this.messages];
  }

  // Добавить новое сообщение
  public add(author: string, text: string): ChatMessage {
    const trimmedAuthor = (author ?? "").trim() || "Anonymous";
    const trimmedText = (text ?? "").trim();

    if (!trimmedText) {
      throw new Error("Сообщение не может быть пустым");
    }

    const safeAuthor = trimmedAuthor.slice(0, 30);
    const safeText = trimmedText.slice(0, 500);

    const message: ChatMessage = {
      id: this.nextId++,
      author: safeAuthor,
      text: safeText,
      timestamp: Date.now(),
    };

    this.messages.push(message);

    // Ограничиваем длину истории
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    return message;
  }
}

export const chatModel = new ChatModel();
