import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Assalomu alaykum! FreshMarket yordamchisiga xush kelibsiz. Sizga qanday yordam bera olaman?",
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isExpanded]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Bo'sh bot xabarini yaratamiz
    const botMessageId = new Date().getTime();
    setMessages((prev) => [
      ...prev,
      { role: "bot", content: "", timestamp: new Date() } // id qo'shish kerak aslida, lekin hozircha array index yetadi
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "bot") {
            lastMessage.content += chunkValue;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content = "Aloqa uzildi, iltimos keyinroq urinib ko'ring.";
        return newMessages;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {isOpen && isExpanded && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out flex flex-col",
        isExpanded 
          ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[700px] h-[80vh]" 
          : "bottom-6 right-6 items-end"
      )}>
        
        {isOpen && (
          <Card className={cn(
            "flex flex-col shadow-2xl border-primary/20 animate-in fade-in zoom-in-95 duration-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            isExpanded ? "w-full h-full rounded-xl" : "w-80 sm:w-96 h-[500px] mb-4 slide-in-from-bottom-5"
          )}>
            <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-xl flex flex-row items-center justify-between space-y-0 shrink-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Yordamchi
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Kichraytirish" : "Kengaytirish"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => {
                    setIsOpen(false);
                    setIsExpanded(false);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          msg.role === "user" ? "bg-primary" : "bg-muted"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-foreground" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm shadow-sm",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none"
                        )}
                      >
                        {msg.content.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.content.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-background/50 shrink-0">
              <div className="flex w-full items-center gap-2">
                <Input
                  placeholder="Xabar yozing..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 focus-visible:ring-primary bg-background"
                />
                <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Floating Toggle Button (Only visible when chat is closed or when not expanded in default view) */}
        {!isExpanded && (
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg hover-elevate transition-all duration-300 p-0 z-50",
              isOpen ? "rotate-90 scale-0 hidden" : "rotate-0 scale-100"
            )}
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
        )}
      </div>
    </>
  );
}