import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { toast } from "sonner";
import remarkGfm from 'remark-gfm'
import Markdown from "react-markdown";
import {CreatePostDialog} from "@/pages/CreatePost.tsx";

interface Message {
  id: string;
  content: string;
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
                  "text": "Create a creative LinkedIn post about the IT field, focusing on emerging trends or technological innovation. The post should be engaging and capable of sparking discussion. Use accessible language, with touches of enthusiasm and curiosity. Also, include a question at the end to encourage the community to share their opinions. Use hashtags related to IT and innovation. " + input
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
        content: data.candidates[0].content.parts[0].text,
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <CreatePostDialog content=""/>
        <UserButton />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <span>Did you like the answer?</span>
                    <CreatePostDialog content={message.content}/>
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
