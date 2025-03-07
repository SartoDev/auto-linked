export enum Role {
    USER = 'user',
    MODEL = 'model',
    SYSTEM = 'system',
}

export class Message {
    id?: string;

    content: string;

    role: Role;

    chat: string;

    constructor(content: string, role: Role, chat: string);
    constructor(content: string, role: Role, chat: string, id?: string);
    constructor(content: string, role: Role, chat: string, id?: string) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.chat = chat;
    }

    static fromJson(json: Map<string, unknown>): Message {
        if (!json || typeof json !== "object") {
            throw new Error("JSON inválido para Message");
        }
        return new Message(json["content"], json["role"], json["chat"], json["id"]);
    }
}