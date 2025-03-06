import {useEffect, useRef, useState} from "react";
import {UserButton} from "@clerk/clerk-react";
import {toast} from "sonner";
import remarkGfm from 'remark-gfm'
import Markdown from "react-markdown";
import {CreatePostDialog} from "@/pages/CreatePost.tsx";
import {ChatSession, Content, GoogleGenerativeAI} from "@google/generative-ai";
import {Button} from "@/components/ui/button.tsx";
import {ArrowUp, ChevronDown, Copy, Loader2, Send, SquarePen, Trash2} from "lucide-react";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {MessageService} from "@/message/message.service.ts";
import { Message, Role } from "@/message/message.ts";
import * as React from "react";
import {useParams} from "react-router-dom";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

const ChatPageSlug = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });
  const [chat, setChat] = useState<ChatSession>();
  const messageService = new MessageService();
  const [messageHistory, setMessageHistory] = useState<Content[]>();
  const { chatId } = useParams();
  const [copySuccess, setCopySuccess] = useState('');

  async function startChatByUserMessages() {
    const messages = await messageService.filterByChatId(chatId);
    const messageHistory = [];
    messages.forEach((e)=> {
      messageHistory.push({
        role: e["role"],
        parts: [{ text: e["content"] }]
      });
      const message: Message = {
        id: Date.now().toString(),
        content: e["content"],
        role: e["role"],
        chat: e["chat"],
      };

      setMessages((prev) => [...prev, message]);
    });
    if(messageHistory.length > 0) {
      setMessageHistory(messageHistory);
      setChat(model.startChat({ history: messageHistory }));
    }
  }

  useEffect(() => {
    startChatByUserMessages()
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

    setInput("");
    setIsLoading(true);

    const responseMessage = await messageService.create(new Message(input, Role.USER, chatId));

    setMessages((prev) => [...prev, responseMessage]);

    try {
      let fullText = "";
      
      const result = await chat.sendMessageStream(input);

      const aiMessage = new Message("", Role.MODEL, chatId, (Date.now() + 1).toString());

      setMessages((prev) => [...prev, aiMessage]);

      for await (const chunk of result.stream) {
        fullText += chunk.text();
        setMessages((prev) =>
            prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: fullText } : msg))
        );
      }

      await messageService.create(new Message(fullText, aiMessage.role, chatId));

    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to get AI response. Please try again.", {
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
        () => setCopySuccess('Texto copiado com sucesso!'),
        (err) => setCopySuccess('Falha ao copiar texto.')
    );
    toast.success("Copied successfully!", {
      duration: 3000
    })
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar/>
      <div style={{width:'100%'}} className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center">
            <SidebarTrigger />
            <Button variant="ghost" size="icon">
              <a href="/">
                <SquarePen />
              </a>
            </Button>
            <h2 className="text-xl font-semibold">Auto Linked</h2>
          </div>
          <CreatePostDialog icon={false} content=""/>
          <UserButton />
        </header>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
              <div className="gap-1 flex flex-col">
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
                    <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>

                  </div>
                </div>
                {message.role === Role.MODEL && <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => copyToClipboard(message.content)} variant="ghost" size="icon">
                          <Copy/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <CreatePostDialog icon={true} content={message.content}/>
                </div>
                }
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
            <Button
                type="submit" size="icon"
                disabled={!input.trim() || isLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <ArrowUp/> }
            </Button>
          </div>
        </form>
      </div>
    </SidebarProvider>
  );
};

export default ChatPageSlug;
