"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";

interface ResultsDisplayProps {
  results: any[];
  rowCount: number;
}

export function ResultsDisplay({ results, rowCount }: ResultsDisplayProps) {
  if (!results || results.length === 0) {
    return (
      <Card className="w-full border-border/40 bg-muted/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center">
              <Inbox className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <p className="text-sm text-muted-foreground">
              No rows returned
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(results[0]);

  return (
    <Card className="w-full bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Query Results</CardTitle>
          <Badge variant="secondary" className="font-mono">
            {rowCount} row{rowCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="text-left py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`} className="py-2.5 px-4">
                      {row[column] !== null && row[column] !== undefined ? (
                        <span className="font-mono text-xs">
                          {String(row[column])}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">
                          null
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
