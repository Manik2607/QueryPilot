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
    <div className="bg-gradient-to-t from-background via-background to-transparent pb-6 pt-2 pointer-events-none sticky bottom-0 z-30">
      <div className="max-w-4xl mx-auto px-4 pointer-events-auto">
        <div className="relative px-2 flex items-end gap-3 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-2xl ring-1 ring-border/50">
          <Select
            value={mode}
            onValueChange={(value) => setMode(value as QueryMode)}
            disabled={isLoading}
          >
            <SelectTrigger className="m-auto h-14 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted/80 border-0 focus:ring-0 transition-colors cursor-pointer data-[disabled]:opacity-50">
              <div className="text-muted-foreground group-hover:text-foreground">
                {getModeIcon(mode)}
              </div>
              <span className="sr-only">
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent side="top" align="start" className="w-[240px] p-2 border border-border/50 shadow-xl bg-popover/95 backdrop-blur-xl z-50">
              <SelectItem value={QueryMode.READ_ONLY} className="rounded-lg focus:bg-accent focus:text-accent-foreground cursor-pointer my-1">
                <div className="flex items-center gap-3 py-1">
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Read Only</div>
                    <div className="text-[10px] text-muted-foreground">
                      Safe for viewing data
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={QueryMode.SAFE} className="rounded-lg focus:bg-accent focus:text-accent-foreground cursor-pointer my-1">
                <div className="flex items-center gap-3 py-1">
                  <div className="p-2 rounded-md bg-green-500/10 text-green-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Safe Mode</div>
                    <div className="text-[10px] text-muted-foreground">
                      Confirms changes
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value={QueryMode.FULL_ACCESS} className="rounded-lg focus:bg-accent focus:text-accent-foreground cursor-pointer my-1">
                <div className="flex items-center gap-3 py-1">
                  <div className="p-2 rounded-md bg-red-500/10 text-red-500">
                    <Unlock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Full Access</div>
                    <div className="text-[10px] text-muted-foreground">
                      No confirmation
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 min-h-[48px] relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? "Connect to a database to start..."
                  : mode === QueryMode.READ_ONLY ? "Ask to retrieve data..." : "Ask questions or request changes..."
              }
              disabled={disabled || isLoading}
              className="w-full h-full min-h-[48px] py-3 px-4 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/50 shadow-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={disabled || isLoading || !input.trim()}
            size="icon"
            className="h-12 w-12 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none border-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white ml-0.5" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
          <span>{getModeDescription(mode)}</span>
          <span>•</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
