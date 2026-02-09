"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface QueryInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function QueryInput({
  onSendMessage,
  disabled,
  isLoading,
}: QueryInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() && !disabled && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-background flex-shrink-0">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-3 items-end">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Connect to a database to start querying..."
                : "Ask a question about your database..."
            }
            disabled={disabled || isLoading}
            className="flex-1 min-h-[44px] px-4 bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-ring rounded-xl"
          />
          <Button
            onClick={handleSubmit}
            disabled={disabled || isLoading || !input.trim()}
            size="icon"
            className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
