import {useEffect, useRef, useState} from "react";
import {UserButton, useUser} from "@clerk/clerk-react";
import {toast} from "sonner";
import remarkGfm from 'remark-gfm'
import Markdown from "react-markdown";
import {CreatePostDialog} from "@/pages/CreatePost.tsx";
import {ChatSession, GoogleGenerativeAI} from "@google/generative-ai";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUp, ChevronDown, Loader2, Moon, SquarePen, Sun} from "lucide-react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {ChatService} from "@/chat/chat.service.ts";
import Chat from "@/chat/chat.ts";
import {MessageService} from "@/message/message.service.ts";
import { Message, Role } from "@/message/message.ts";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {useTheme} from "@/components/theme-provider.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser()
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });
  const chat = model.startChat();
  const chatService = new ChatService();
  const messageService = new MessageService();
  const navigate = useNavigate();
  const { setTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setInput("");
    setIsLoading(true);

    const responseChat = await chatService.create(new Chat(user.id, input));

    const responseMessage = await messageService.create(new Message(input, Role.USER, responseChat.id));

    setMessages((prev) => [...prev, responseMessage]);

    try {
      let fullText = "";

      const result = await chat.sendMessageStream(input);

      const aiMessage = new Message("", Role.MODEL, responseChat.id, (Date.now() + 1).toString());

      setMessages((prev) => [...prev, aiMessage]);

      for await (const chunk of result.stream) {
        fullText += chunk.text();
        setMessages((prev) =>
            prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: fullText } : msg))
        );
      }

      await messageService.create(new Message(fullText, aiMessage.role, responseChat.id));

    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to get AI response. Please try again.", {
        duration: 3000
      });
    } finally {
      navigate(`/${responseChat.id}`);
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar/>
      <div style={{width:'100%'}} className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center">
            <SidebarTrigger/>
            <a href="/">
              <h2 className="text-xl font-semibold">Auto Linked</h2>
            </a>
          </div>
          <CreatePostDialog icon={true} content=""/>
          <div className="flex gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserButton />
          </div>
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
              <div
                  key={message.id}
                  className={`flex ${message.role === Role.USER ? "justify-end" : "justify-start"}`}
              >
                <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === Role.USER
                            ? "bg-primary text-white"
                            : "bg-muted"
                    } animate-fade-in`}
                >
                  {message.role === Role.SYSTEM ? (
                      <div className="flex items-center gap-2">
                        <span>Did you like the answer?</span>
                        <CreatePostDialog icon={true} content={message.content}/>
                      </div>
                  ) : (
                      <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                  )}

                </div>
              </div>
          ))}
          <div ref={chatEndRef} />
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
            <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <ArrowUp/> }
            </Button>
          </div>
        </form>
      </div>
    </SidebarProvider>
  );
};

export default ChatPage;
