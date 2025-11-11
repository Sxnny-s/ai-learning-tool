"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import Markdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatBotFunctional = () => {
  // Functional logic from chat-component.tsx
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm your AI learning assistant. How can I help you with your studies today?"
      }]);
    }
  }, [user, messages.length]);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim()
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Create assistant message placeholder for streaming
    const assistantMessage: Message = {
      role: "assistant",
      content: ""
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // NOTE: Skipping Clerk authentication token check as requested,
      // but still need the placeholder to avoid compiler error.
      const token = await getToken();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // Pass token if needed for API
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId: sessionId,
          sessionType: "tutoring"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Get session ID from response headers
      const newSessionId = response.headers.get("X-Session-ID");
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and add it directly to the message
        const chunk = decoder.decode(value, { stream: true });

        if (chunk) {
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1 && msg.role === "assistant"
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");

      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };


  // Skip Clerk loading/sign-in UI, but still show loading for the API call

  // NOTE: For a real app, you should NOT skip the `!userLoaded` check.
  if (!userLoaded) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Learning Assistant
        </CardTitle>
        <CardDescription>
          Interactive chatbot for student support and tutoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scroll Area for Messages */}
        <ScrollArea
          className="min-h-[500px] w-full border rounded-md p-4"
          ref={scrollAreaRef}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  } rounded-lg p-3 max-w-[80%]`}
                >
                  {/* <p className="text-sm whitespace-pre-wrap"> */}
                    <Markdown>{message.content}</Markdown>
                    {/* {message.content} */}
                  {/* </p> */}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {/* Use user's initials or a default icon */}
                      {user?.firstName?.[0] || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Display "AI is thinking..." */}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            Error: {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Ask me anything about your studies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
