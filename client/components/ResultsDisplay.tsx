"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResultsDisplayProps {
  results: any[];
  rowCount: number;
}

export function ResultsDisplay({ results, rowCount }: ResultsDisplayProps) {
  if (!results || results.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No results returned
          </p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(results[0]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Query Results</CardTitle>
          <Badge variant="secondary">
            {rowCount} row{rowCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="text-left py-2 px-3 font-medium bg-muted/50"
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
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`} className="py-2 px-3">
                      {row[column] !== null && row[column] !== undefined ? (
                        String(row[column])
                      ) : (
                        <span className="text-muted-foreground italic">
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
