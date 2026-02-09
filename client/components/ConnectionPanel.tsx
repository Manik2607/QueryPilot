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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [dbType, setDbType] = useState<string>("mysql");
  const [credentials, setCredentials] = useState({
    host: "localhost",
    port: "3306",
    database: "appdb",
    user: "root",
    password: "root",
    path: "",
  });

  const handleDbTypeChange = (type: string) => {
    setDbType(type);

    // Pre-fill credentials based on database type
    if (type === "mysql") {
      setCredentials({
        host: "localhost",
        port: "3306",
        database: "appdb",
        user: "root",
        password: "root",
        path: "",
      });
    } else if (type === "postgresql") {
      setCredentials({
        host: "localhost",
        port: "5432",
        database: "",
        user: "",
        password: "",
        path: "",
      });
    } else if (type === "sqlite") {
      setCredentials({
        host: "",
        port: "",
        database: "",
        user: "",
        password: "",
        path: "./data/querypilot.db",
      });
    }
  };

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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <Database className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold">Database</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 px-4 pb-4">
          {connected && (
            <Card className="border-green-500/40 bg-green-500/10">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
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

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Connection</CardTitle>
              <CardDescription className="text-xs">
                Database credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="db-type">Database Type</Label>
                <Select value={dbType} onValueChange={handleDbTypeChange}>
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
                        setCredentials({
                          ...credentials,
                          database: e.target.value,
                        })
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
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleConnect}
                disabled={!isFormValid() || isLoading}
                className="w-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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

          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-2">
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-2">💡 Quick Start</p>
                  <ul className="list-disc list-inside space-y-1.5">
                    <li>Connect to your database</li>
                    <li>Ask questions in plain English</li>
                    <li>Get SQL queries & results</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
