"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageList } from "@/components/MessageList";
import { QueryInput, QueryMode } from "@/components/QueryInput";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { apiClient } from "@/lib/api-client";

export interface Message {
  id: string;
  type: "user" | "assistant" | "error" | "confirmation";
  content: string;
  sql?: string;
  results?: any[];
  rowCount?: number;
  timestamp: Date;
  queryType?: string;
  pendingQuery?: {
    sql: string;
    database: string;
  };
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentDatabase, setCurrentDatabase] = useState<string>("");
  const [schema, setSchema] = useState<object | undefined>(undefined);

  const handleSendMessage = async (question: string, mode: QueryMode) => {
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
        mode,
      });
      console.log("Chat response:", response);
      // Check if confirmation is required
      if (response.requiresConfirmation) {
        addMessage({
          type: "confirmation",
          content: `⚠️ The following ${response.queryType?.toUpperCase()} operation requires confirmation. This will modify your database.`,
          sql: response.sql,
          pendingQuery: {
            sql: response.sql,
            database: currentDatabase,
          },
          queryType: response.queryType,
        });
      } else {
        // Add assistant response
        addMessage({
          type: "assistant",
          content: `Generated SQL query executed successfully. ${response.rowCount} row(s) returned.`,
          sql: response.sql,
          results: response.results,
          rowCount: response.rowCount,
        });
      }
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

  const handleExecuteConfirmed = async (sql: string, database: string) => {
    setIsLoading(true);

    try {
      const response = await apiClient.executeConfirmedQuery({
        sql,
        database,
      });

      addMessage({
        type: "assistant",
        content: `✅ Query executed successfully. ${response.rowCount} row(s) affected.`,
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
            : "An error occurred while executing the query.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    addMessage({
      type: "assistant",
      content: "❌ Query execution cancelled.",
    });
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
    <div className="flex h-full bg-background relative selection:bg-primary/20">
      {/* Sidebar for database connection */}
      <div className="w-80 flex flex-col z-20 shadow-2xl shadow-black/5 bg-background/30 backdrop-blur-xl border-r border-border/20">
        <ConnectionPanel
          onConnect={handleConnect}
          connected={connected}
          currentDatabase={currentDatabase}
          isLoading={isLoading}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageList
            messages={messages}
            onExecuteConfirmed={handleExecuteConfirmed}
            onCancelConfirmation={handleCancelConfirmation}
          />
          <QueryInput
            onSendMessage={handleSendMessage}
            disabled={!connected || isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
