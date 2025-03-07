import { Message } from "@/message/message.ts";

export class MessageService {
    private messageUrl = `${import.meta.env.VITE_API_URL}/messages`;

    async create(message: Message): Promise<Message> {
        const response = await fetch(this.messageUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const messageData = await response.json();

        return Message.fromJson(messageData);
    }

    async getAll(): Promise<Message[]> {
        const response = await fetch(this.messageUrl, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const chatData = await response.json();

        return chatData.map((chat: Map<string, unknown>) => Message.fromJson(chat));
    }

    async filterByChatId(chatId: string): Promise<Message[]> {
        const response = await fetch(`${this.messageUrl}?chat-id=${chatId}`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const chatData = await response.json();

        return chatData.map((chat: Map<string, unknown>) => Message.fromJson(chat));
    }
}
