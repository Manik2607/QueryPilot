"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Message } from "./ChatInterface";
import { ResultsDisplay } from "./ResultsDisplay";
import { Database, User, AlertCircle, AlertTriangle, Check, X } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  onExecuteConfirmed?: (sql: string, database: string) => void;
  onCancelConfirmation?: () => void;
}

export function MessageList({ messages, onExecuteConfirmed, onCancelConfirmation }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 h-0">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">
              Welcome to QueryPilot
            </h3>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Connect to a database and start asking questions in natural
              language. I'll convert your questions into SQL queries and show
              you the results.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
    <div className={`group relative ${isUser ? "flex justify-end" : ""}`}>
      <div
        className={`flex gap-4 items-start ${isUser ? "flex-row-reverse max-w-[85%]" : "max-w-full"}`}
      >
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarFallback
            className={
              isUser
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                : isError
                  ? "bg-destructive text-destructive-foreground"
                  : isConfirmation
                    ? "bg-yellow-500 text-white"
                    : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            }
          >
            {isUser ? (
              <User className="h-4 w-4" />
            ) : isError ? (
              <AlertCircle className="h-4 w-4" />
            ) : isConfirmation ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Database className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3 min-w-0">
          <div
            className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}
          >
            <span className="text-sm font-semibold">
              {isUser ? "You" : isError ? "Error" : isConfirmation ? "Confirmation Required" : "QueryPilot"}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>

          <div
            className={`prose prose-sm dark:prose-invert max-w-none ${isUser ? "text-right" : ""}`}
          >
            <p
              className={`text-[15px] leading-7 whitespace-pre-wrap m-0 ${isUser ? "bg-primary/10 dark:bg-primary/20 rounded-2xl px-4 py-2.5 inline-block" : ""}`}
            >
              {message.content}
            </p>
          </div>

          {message.sql && (
            <Card className="bg-secondary/50">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    SQL Query
                  </Badge>
                </div>
                <pre className="text-xs font-mono overflow-x-auto bg-muted/50 rounded-md p-3">
                  <code className="text-foreground">{message.sql}</code>
                </pre>
              </div>
            </Card>
          )}

          {isConfirmation && message.pendingQuery && (
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <div className="px-4 py-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                  Are you sure you want to execute this {message.queryType?.toUpperCase()} query? This action will modify your database.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (onExecuteConfirmed && message.pendingQuery) {
                        onExecuteConfirmed(message.pendingQuery.sql, message.pendingQuery.database);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Execute Query
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (onCancelConfirmation) {
                        onCancelConfirmation();
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {message.results && message.results.length > 0 && (
            <ResultsDisplay
              results={message.results}
              rowCount={message.rowCount || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
