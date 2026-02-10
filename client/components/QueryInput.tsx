"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ShieldCheck, Eye, Unlock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export enum QueryMode {
  READ_ONLY = "read-only",
  SAFE = "safe",
  FULL_ACCESS = "full-access",
}

interface QueryInputProps {
  onSendMessage: (message: string, mode: QueryMode) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function QueryInput({
  onSendMessage,
  disabled,
  isLoading,
}: QueryInputProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<QueryMode>(QueryMode.SAFE);

  const handleSubmit = () => {
    if (input.trim() && !disabled && !isLoading) {
      onSendMessage(input.trim(), mode);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getModeIcon = (currentMode: QueryMode) => {
    switch (currentMode) {
      case QueryMode.READ_ONLY:
        return <Eye className="h-4 w-4" />;
      case QueryMode.SAFE:
        return <ShieldCheck className="h-4 w-4" />;
      case QueryMode.FULL_ACCESS:
        return <Unlock className="h-4 w-4" />;
    }
  };

  const getModeDescription = (currentMode: QueryMode) => {
    switch (currentMode) {
      case QueryMode.READ_ONLY:
        return "Only SELECT queries allowed";
      case QueryMode.SAFE:
        return "Confirms before dangerous operations";
      case QueryMode.FULL_ACCESS:
        return "All operations allowed";
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <Select
            value={mode}
            onValueChange={(value) => setMode(value as QueryMode)}
            disabled={disabled || isLoading}
          >
            <SelectTrigger className="h-11 min-w-[200px] min-h-[44px] rounded-xl bg-muted/50 border-border/40">
              <div className="flex items-center gap-2">
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value={QueryMode.READ_ONLY}>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Read Only</div>
                    <div className="text-xs text-muted-foreground">
                      View data only
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={QueryMode.SAFE}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Safe Mode</div>
                    <div className="text-xs text-muted-foreground">
                      Asks before changes
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={QueryMode.FULL_ACCESS}>
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Full Access</div>
                    <div className="text-xs text-muted-foreground">
                      All operations
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
          {getModeDescription(mode)} • Press Enter to send
        </p>
      </div>
    </div>
  );
}
