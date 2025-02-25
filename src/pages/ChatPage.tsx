import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { toast } from "sonner";
import remarkGfm from 'remark-gfm'
import Markdown from "react-markdown";
import {DialogDemo} from "@/pages/CreatePost.tsx";

interface Message {
  id: string;
  content?: string;
  isUser: boolean;
  role?: "user" | "assistant" | "system";
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBOCyUHnyGl34hfZjcc1dOFf32aacYbDsM`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "contents": [
            {
              "parts": [
                {
                  "text": input
                }
              ]
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.candidates[0].content.parts[0].text,
        isUser: false,
        role: "assistant"
      };

      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        isUser: false,
        role: "system"
      };

      setMessages((prev) => [...prev, aiMessage]);
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  function formatText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/_(.*?)_/g, '<i>$1</i>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <UserButton />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span>Gostou da resposta?</span>
          <DialogDemo content={"Dica de JavaScript: Deixe suas listas mais naturais com Intl.ListFormat\n" +
              "\n" +
              "Já precisou transformar uma lista em uma frase bem escrita, tipo \"chocolate, baunilha e morango\", sem ter que ficar juntando tudo na mão? O JavaScript tem uma ferramenta ótima pra isso: a API Intl.ListFormat.\n" +
              "\n" +
              "Olha no print como fica simples!\n" +
              "\n" +
              "O que tá acontecendo aqui?\n" +
              "\n" +
              "O Intl.ListFormat formata a lista seguindo as regras do idioma, no caso, português do Brasil com 'pt-BR'.\n" +
              "\n" +
              "Com { style: 'long', type: 'conjunction' }, ele separa os itens com vírgula e coloca um \"e\" antes do último, do jeitinho que a gente fala.\n" +
              "\n" +
              "Por que isso é legal?\n" +
              "\n" +
              "Imagina um sistema que diz: \"Você escolheu chocolate, baunilha e morango\". Usando essa API, não preciso ficar mexendo com strings manualmente, e o código ainda funciona pra outros idiomas ou estilos (tipo trocar o \"e\" por \"ou\" mudando pra 'disjunction'). É prático e deixa tudo mais elegante.\n" +
              "\n" +
              "Você já usou algo assim no seu projeto? Conta aí nos comentários, quero trocar ideia!\n" +
              "\n" +
              "\n" +
              "\n" +
              "\n" +
              "\n" +
              "hashtag#JavaScript hashtag#Programação hashtag#DicaDeCódigo hashtag#frontend"}/>
        </div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.isUser
                  ? "bg-primary text-white"
                  : "bg-muted"
              } animate-fade-in`}
            >
              {message.role === "system" ? (
                  <div className="flex items-center gap-2">
                    <span>Gostou da resposta?</span>
                    <DialogDemo content={message.content}/>
                  </div>
              ) : (
                  <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
              )}

            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-muted p-4 rounded-2xl">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t bg-background/80 backdrop-blur-sm"
      >
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
