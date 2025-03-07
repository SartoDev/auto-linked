import { Message } from "@/message/message.ts";

export default class Chat {
    id: string;
    userId: string;
    name?: string;
    messages?: Message[];

    constructor(userId: string, name: string);
    constructor(userId: string, name: string, id: string);
    constructor(userId: string, name: string, id?: string, messages?: Message[]) {
        this.userId = userId;
        this.name = name;
        this.id = id;
        this.messages = messages;
    }

    static fromJson(json: Map<string, unknown>): Chat {
        if (!json || typeof json !== "object") {
            throw new Error("JSON inválido para Chat");
        }
        return new Chat(json["userId"], json["name"], json["id"]);
    }
}
