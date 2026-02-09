"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ConnectionPanelProps {
  onConnect: (type: string, credentials: any) => void;
  connected: boolean;
  currentDatabase: string;
  isLoading: boolean;
}

export function ConnectionPanel({
  onConnect,
  connected,
  currentDatabase,
  isLoading,
}: ConnectionPanelProps) {
  const [dbType, setDbType] = useState<string>("postgresql");
  const [credentials, setCredentials] = useState({
    host: "localhost",
    port: "",
    database: "",
    user: "",
    password: "",
    path: "",
  });

  const handleConnect = () => {
    const creds =
      dbType === "sqlite"
        ? { path: credentials.path }
        : {
            host: credentials.host,
            port: parseInt(credentials.port) || undefined,
            database: credentials.database,
            user: credentials.user,
            password: credentials.password,
          };

    onConnect(dbType, creds);
  };

  const isFormValid = () => {
    if (dbType === "sqlite") {
      return credentials.path.trim() !== "";
    }
    return (
      credentials.host.trim() !== "" &&
      credentials.database.trim() !== "" &&
      credentials.user.trim() !== ""
    );
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Database Connection</h2>
      </div>

      <Separator className="mb-4" />

      {connected && (
        <Card className="mb-4 border-green-500/50 bg-green-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Connected</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentDatabase}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection Details</CardTitle>
          <CardDescription>Enter your database credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="db-type">Database Type</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger id="db-type">
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dbType === "sqlite" ? (
            <div className="space-y-2">
              <Label htmlFor="path">Database Path</Label>
              <Input
                id="path"
                type="text"
                placeholder="/path/to/database.db"
                value={credentials.path}
                onChange={(e) =>
                  setCredentials({ ...credentials, path: e.target.value })
                }
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  type="text"
                  placeholder="localhost"
                  value={credentials.host}
                  onChange={(e) =>
                    setCredentials({ ...credentials, host: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder={dbType === "postgresql" ? "5432" : "3306"}
                  value={credentials.port}
                  onChange={(e) =>
                    setCredentials({ ...credentials, port: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  type="text"
                  placeholder="mydatabase"
                  value={credentials.database}
                  onChange={(e) =>
                    setCredentials({ ...credentials, database: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  type="text"
                  placeholder="username"
                  value={credentials.user}
                  onChange={(e) =>
                    setCredentials({ ...credentials, user: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <Button
            onClick={handleConnect}
            disabled={!isFormValid() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : connected ? (
              "Reconnect"
            ) : (
              "Connect"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-auto pt-4">
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">💡 Quick Start</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Connect to your database</li>
                  <li>Ask questions in plain English</li>
                  <li>Get SQL queries & results</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
