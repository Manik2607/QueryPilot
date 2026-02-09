"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Message } from "./ChatInterface";
import { ResultsDisplay } from "./ResultsDisplay";
import { Database, User, AlertCircle } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Welcome to QueryPilot
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Connect to a database and start asking questions in natural
              language. I'll convert your questions into SQL queries and show
              you the results.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
      </div>
    </ScrollArea>
  );
}

function MessageItem({ message }: { message: Message }) {
  const isUser = message.type === "user";
  const isError = message.type === "error";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className={
              isError
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }
          >
            {isError ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Database className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
      >
        <Card
          className={`px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : isError
                ? "bg-destructive/10 border-destructive"
                : "bg-muted"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </Card>

        {message.sql && (
          <Card className="w-full bg-secondary/50 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                SQL Query
              </Badge>
            </div>
            <pre className="text-xs overflow-x-auto">
              <code>{message.sql}</code>
            </pre>
          </Card>
        )}

        {message.results && message.results.length > 0 && (
          <ResultsDisplay
            results={message.results}
            rowCount={message.rowCount || 0}
          />
        )}

        <span className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
