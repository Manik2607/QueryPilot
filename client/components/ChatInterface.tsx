"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageList } from "@/components/MessageList";
import { QueryInput } from "@/components/QueryInput";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { apiClient } from "@/lib/api-client";

export interface Message {
  id: string;
  type: "user" | "assistant" | "error";
  content: string;
  sql?: string;
  results?: any[];
  rowCount?: number;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentDatabase, setCurrentDatabase] = useState<string>("");
  const [schema, setSchema] = useState<object | undefined>(undefined);

  const handleSendMessage = async (question: string) => {
    if (!connected || !currentDatabase) {
      addMessage({
        type: "error",
        content: "Please connect to a database first.",
      });
      return;
    }

    // Add user message
    addMessage({
      type: "user",
      content: question,
    });

    setIsLoading(true);

    try {
      const response = await apiClient.sendChatMessage({
        question,
        database: currentDatabase,
        schema,
      });

      // Add assistant response
      addMessage({
        type: "assistant",
        content: `Generated SQL query executed successfully. ${response.rowCount} row(s) returned.`,
        sql: response.sql,
        results: response.results,
        rowCount: response.rowCount,
      });
    } catch (error) {
      addMessage({
        type: "error",
        content:
          error instanceof Error
            ? error.message
            : "An error occurred while processing your query.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (type: string, credentials: any) => {
    setIsLoading(true);

    try {
      const response = await apiClient.testDatabaseConnection({
        type: type as any,
        credentials,
      });

      if (response.success) {
        setConnected(true);
        setCurrentDatabase(type);
        setSchema(response.schema);
        addMessage({
          type: "assistant",
          content: `Successfully connected to ${type} database. ${response.message}`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      addMessage({
        type: "error",
        content:
          error instanceof Error
            ? error.message
            : "Failed to connect to database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for database connection */}
      <div className="w-80 border-r bg-muted/10">
        <ConnectionPanel
          onConnect={handleConnect}
          connected={connected}
          currentDatabase={currentDatabase}
          isLoading={isLoading}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">QueryPilot</h1>
          <p className="text-sm text-muted-foreground">
            Ask questions in natural language, get SQL queries
          </p>
        </div>

        <Card className="flex-1 m-4 flex flex-col border-none shadow-none">
          <MessageList messages={messages} />
          <QueryInput
            onSendMessage={handleSendMessage}
            disabled={!connected || isLoading}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </div>
  );
}
