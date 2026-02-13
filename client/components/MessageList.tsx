"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Message } from "./ChatInterface";
import { ResultsDisplay } from "./ResultsDisplay";
import { Database, User, AlertCircle, AlertTriangle, Check, X } from "lucide-react";
import React from "react";

/**
 * Renders simple inline markdown: converts **bold** to <strong> tags.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-muted/60 text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

interface MessageListProps {
  messages: Message[];
  onExecuteConfirmed?: (sql: string, database: string) => void;
  onCancelConfirmation?: () => void;
}

export function MessageList({ messages, onExecuteConfirmed, onCancelConfirmation }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 h-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
            <div className="relative mb-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-background to-muted border border-border/50 shadow-2xl">
                <Database className="h-10 w-10 text-primary" />
              </div>
            </div>

            <h3 className="text-3xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              QueryPilot
            </h3>

            <p className="text-base text-muted-foreground/80 max-w-[460px] leading-relaxed mb-8">
              Your AI-powered database assistant. Connect to a database and ask questions in natural language to get instant SQL queries and insights.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:bg-muted/50 transition-colors cursor-pointer text-left">
                <div className="mb-2 h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Database className="h-4 w-4" />
                </div>
                <p className="font-medium text-sm">Connect Database</p>
                <p className="text-xs text-muted-foreground mt-1">MySQL, PostgreSQL, SQLite supported</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:bg-muted/50 transition-colors cursor-pointer text-left">
                <div className="mb-2 h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <User className="h-4 w-4" />
                </div>
                <p className="font-medium text-sm">Ask Questions</p>
                <p className="text-xs text-muted-foreground mt-1">Get precise SQL queries instantly</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onExecuteConfirmed={onExecuteConfirmed}
                onCancelConfirmation={onCancelConfirmation}
              />
            ))}
          </div>
        )}
        {/* Scroll sentinel — always at the bottom */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function MessageItem({
  message,
  onExecuteConfirmed,
  onCancelConfirmation
}: {
  message: Message;
  onExecuteConfirmed?: (sql: string, database: string) => void;
  onCancelConfirmation?: () => void;
}) {
  const isUser = message.type === "user";
  const isError = message.type === "error";
  const isConfirmation = message.type === "confirmation";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <Avatar className="h-8 w-8 shrink-0 mt-1 ring-2 ring-background shadow-sm">
            <AvatarFallback
              className={
                isError
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : isConfirmation
                    ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                    : "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground"
              }
            >
              {isError ? (
                <AlertCircle className="h-4 w-4" />
              ) : isConfirmation ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Database className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col space-y-2 ${isUser ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground">
              {isUser ? "You" : isError ? "Error" : isConfirmation ? "Confirmation Required" : "QueryPilot"}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div
            className={`
              relative px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed
              ${isUser
                ? "bg-gradient-to-br from-primary to-purple-600 text-white rounded-tr-sm"
                : isError
                  ? "bg-destructive/5 text-destructive border border-destructive/10 rounded-tl-sm"
                  : "bg-card border border-border/50 text-foreground rounded-tl-sm"
              }
            `}
          >
            <p className="whitespace-pre-wrap m-0">{renderInlineMarkdown(message.content)}</p>
          </div>

          {message.sql && (
            <div className="w-full min-w-[300px] mt-2 rounded-xl overflow-hidden border border-border/50 shadow-sm bg-muted/30">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/40">
                <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-1.5">
                  <Database className="h-3 w-3" />
                  Generated SQL
                </span>
                <Badge variant="outline" className="text-[10px] h-5 bg-background/50 border-border/40 text-muted-foreground">
                  Read Only
                </Badge>
              </div>
              <div className="p-4 bg-background/50 overflow-x-auto">
                <pre className="text-xs font-mono text-foreground/90 leading-relaxed">
                  <code>{message.sql}</code>
                </pre>
              </div>
            </div>
          )}

          {isConfirmation && message.pendingQuery && (
            <div className="w-full mt-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Attention Required
                  </p>
                  <p className="text-xs text-yellow-700/80 dark:text-yellow-300/80 leading-relaxed">
                    This query will modify your database. Please review the SQL above and confirm if you want to proceed.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (onExecuteConfirmed && message.pendingQuery) {
                          onExecuteConfirmed(message.pendingQuery.sql, message.pendingQuery.database);
                        }
                      }}
                      className="h-8 bg-green-600 hover:bg-green-700 text-white border-0"
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (onCancelConfirmation) {
                          onCancelConfirmation();
                        }
                      }}
                      className="h-8 border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message.results !== undefined && (
            <div className="w-full mt-2">
              <ResultsDisplay
                results={message.results}
                rowCount={message.rowCount || 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
