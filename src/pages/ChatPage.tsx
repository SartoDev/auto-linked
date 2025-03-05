import {useEffect, useRef, useState} from "react";
import {UserButton, useUser} from "@clerk/clerk-react";
import { toast } from "sonner";
import remarkGfm from 'remark-gfm'
import Markdown from "react-markdown";
import { CreatePostDialog } from "@/pages/CreatePost.tsx";
import {ChatSession, GoogleGenerativeAI} from "@google/generative-ai";
import { Button } from "@/components/ui/button.tsx";
import { ChevronDown, SquarePen } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {GoogleAICacheManager} from "@google/generative-ai/server";

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser()
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });
  const [chat, setChat] = useState<ChatSession>(() => model.startChat());
  const baseUrl = import.meta.env.VITE_API_URL;
  const messageUrl = `${baseUrl}/messages`

  async function startChatByUserMessages() {
    const response =  await fetch(`${messageUrl}?user-id=${user?.id}`, {
      method: "GET"
    });
    const messages = await response.json();
    const messageHistory = [];
    messages.forEach((e)=> {
      messageHistory.push({
        role: e["role"],
        parts: [{ text: e["content"] }]
      });
      const message: Message = {
        id: Date.now().toString(),
        content: e["content"],
        isUser: e["role"] == "user",
        role: e["role"],
      };

      setMessages((prev) => [...prev, message]);
    });
    if(messageHistory.length > 0) {
      setChat(model.startChat({ history: messageHistory }));
    }
  }

  useEffect(() => {
    startChatByUserMessages();
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop > clientHeight + 50);
      }
    };

    const chatDiv = chatContainerRef.current;
    if (chatDiv) {
      chatDiv.addEventListener("scroll", handleScroll);
      return () => chatDiv.removeEventListener("scroll", handleScroll);
    }
  }, []);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const raw = JSON.stringify({
      "content": input,
      "userId": user.id,
      "role": "user"
    });

    const responseMessage = await fetch(messageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: raw
    });

    if(responseMessage.status != 201) {
      return;
    }

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
      let fullText = "";

      const result = await chat.sendMessageStream(input);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        isUser: false,
        role: "assistant"
      };

      setMessages((prev) => [...prev, aiMessage]);

      for await (const chunk of result.stream) {
        fullText += chunk.text();
        setMessages((prev) =>
            prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: fullText } : msg))
        );
      }

      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        isUser: false,
        content: fullText,
        role: "system"
      };

      const rawIA = JSON.stringify({
        "content": fullText,
        "userId": user.id,
        "role": "model"
      });

      const responseMessageIA = await fetch(messageUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: rawIA
      });

      if(responseMessageIA.status != 201) {
        return;
      }

      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar/>
      <div style={{width:'100%'}} className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center">
            <SidebarTrigger />
            <Button onClick={scrollToBottom} variant="ghost" size="icon">
              <SquarePen />
            </Button>
            <Button variant="ghost">
              Auto Linked
            </Button>
          </div>
          <CreatePostDialog content=""/>
          <UserButton />
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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

            <Button
                style={{
                  position: "absolute",
                  bottom: "80px",
                  left: "50%",
                  opacity: showScrollButton ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
                onClick={scrollToBottom} variant="outline" size="icon">
              <ChevronDown />
            </Button>
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
    </SidebarProvider>
  );
};

export default ChatPage;
