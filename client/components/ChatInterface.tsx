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
  affectedRowCount?: number;
  timestamp: Date;
  queryType?: string;
  pendingQuery?: {
    sql: string;
    database: string;
  };
}

/**
 * Generates a short, human-friendly AI explanation of the query results.
 * For mutation queries, uses affectedRowCount (rows changed) and rowCount (current table size from follow-up SELECT).
 */
function generateResultsSummary(
  response: { sql: string; results: any[]; rowCount: number; affectedRowCount?: number; queryType?: string }
): string {
  const { sql, results, rowCount, affectedRowCount, queryType } = response;
  const type = (queryType || 'select').toLowerCase();
  const sqlUpper = sql.toUpperCase().trim();
  const affected = affectedRowCount ?? 0;

  // DDL operations (CREATE, ALTER, DROP)
  if (['create', 'alter', 'drop'].includes(type) || /^(CREATE|ALTER|DROP)\b/.test(sqlUpper)) {
    if (type === 'create' || sqlUpper.startsWith('CREATE')) {
      const suffix = rowCount > 0 ? ` The table currently has **${rowCount}** row${rowCount !== 1 ? 's' : ''}.` : '';
      return `✅ The structure was created successfully.${suffix}`;
    }
    if (type === 'drop' || sqlUpper.startsWith('DROP')) {
      return '✅ The structure was dropped successfully.';
    }
    const suffix = rowCount > 0 ? ` The table now has **${rowCount}** row${rowCount !== 1 ? 's' : ''}.` : '';
    return `✅ Schema modification completed successfully.${suffix}`;
  }

  // Modification queries — use affectedRowCount for the "changed" count,
  // and rowCount / results for the current table state.
  if (type === 'insert') {
    const suffix = rowCount > 0 ? ` The table now has **${rowCount}** row${rowCount !== 1 ? 's' : ''}.` : '';
    return `✅ Insert completed — **${affected}** row${affected !== 1 ? 's' : ''} added.${suffix}`;
  }
  if (type === 'update') {
    if (affected === 0) {
      return '⚠️ Update executed, but **no rows matched** the condition — nothing was changed.';
    }
    const suffix = rowCount > 0 ? ` The table now has **${rowCount}** row${rowCount !== 1 ? 's' : ''}.` : '';
    return `✅ Update completed — **${affected}** row${affected !== 1 ? 's' : ''} modified.${suffix}`;
  }
  if (type === 'delete') {
    if (affected === 0) {
      return '⚠️ Delete executed, but **no rows matched** the condition — nothing was removed.';
    }
    const suffix = rowCount > 0
      ? ` **${rowCount}** row${rowCount !== 1 ? 's' : ''} remaining in the table.`
      : ' The table is now empty.';
    return `✅ Delete completed — **${affected}** row${affected !== 1 ? 's' : ''} removed.${suffix}`;
  }

  // SELECT queries
  if (type === 'select' || results !== undefined) {
    if (!results || results.length === 0) {
      const tableMatch = sql.match(/FROM\s+[`"']?(\w+)[`"']?/i);
      const tableName = tableMatch ? `**${tableMatch[1]}**` : 'the table';
      return `📭 The query ran successfully but returned **no results**. ${tableName} appears to be empty or no rows matched your criteria.`;
    }

    const columns = Object.keys(results[0]);
    const colList = columns.length <= 4
      ? columns.map(c => `\`${c}\``).join(', ')
      : columns.slice(0, 3).map(c => `\`${c}\``).join(', ') + ` and ${columns.length - 3} more`;

    if (rowCount === 1) {
      return `✅ Found **1 row** with columns ${colList}.`;
    }

    return `✅ Found **${rowCount} rows** with columns ${colList}.`;
  }

  // Fallback
  return `✅ Query executed successfully. ${affected} row${affected !== 1 ? 's' : ''} affected.`;
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
        // Add assistant response with AI-generated summary
        const summary = generateResultsSummary(response);
        addMessage({
          type: "assistant",
          content: summary,
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

  const removeConfirmationMessages = () => {
    setMessages((prev) => prev.filter((m) => m.type !== "confirmation"));
  };

  const handleExecuteConfirmed = async (sql: string, database: string) => {
    removeConfirmationMessages();
    setIsLoading(true);

    try {
      const response = await apiClient.executeConfirmedQuery({
        sql,
        database,
      });

      const summary = generateResultsSummary(response);
      addMessage({
        type: "assistant",
        content: summary,
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
    removeConfirmationMessages();
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
