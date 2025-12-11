"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableModels, defaultModel } from "@/lib/openrouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Playground() {
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: userMessage.content },
          ],
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let fullContent = "";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: fullContent } : m
          )
        );
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "An error occurred");
      setMessages((prev) => prev.slice(0, -1)); // Remove failed message
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([]);
    setError(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Playground</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearChat} size="sm">
            Clear
          </Button>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4 mb-4 h-[500px] overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ask something to test the support bot...
          </p>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-100 text-red-800">
            <p className="text-sm">Error: {error}</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id}>
            <div
              className={`p-3 rounded-lg ${
                m.role === "user" ? "bg-muted ml-12" : "bg-primary/10 mr-12"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-muted-foreground">Typing...</div>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Где найти пароль от курса?"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
