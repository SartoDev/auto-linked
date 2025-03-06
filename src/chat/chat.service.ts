import Chat from "@/chat/chat.ts";

export class ChatService {
    private chatUrl = `${import.meta.env.VITE_API_URL}/chats`;

    async create(chat: Chat): Promise<Chat> {
        const response = await fetch(this.chatUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chat)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const chatData = await response.json();

        return Chat.fromJson(chatData);
    }

    async getAll(): Promise<Chat[]> {
        const response = await fetch(this.chatUrl, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const chatData = await response.json();

        return chatData.map((chat: Map<string, unknown>) => Chat.fromJson(chat));
    }

    async filterByUserId(userId: string): Promise<Chat[]> {
        const response = await fetch(`${this.chatUrl}?user-id=${userId}`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const chatData = await response.json();

        return chatData.map((chat: Map<string, unknown>) => Chat.fromJson(chat));
    }

    async update(id: string, chat: Chat): Promise<string> {
        const response = await fetch(`${this.chatUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chat)
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.text();
    }

    async delete(id: string): Promise<string> {
        const response = await fetch(`${this.chatUrl}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return await response.text();
    }
}
