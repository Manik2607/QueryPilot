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
    <div className="h-full flex flex-col p-4 bg-background/50 backdrop-blur-3xl">
      <div className="flex items-center gap-3 px-2 pb-6 pt-2">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wide text-foreground">Database</h2>
          <p className="text-xs text-muted-foreground">Connection settings</p>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-6">
          {connected ? (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">Connected</p>
                  <p className="text-xs text-green-600/80 dark:text-green-500/80 capitalize font-medium">
                    {currentDatabase}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-orange-400/80" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/80">Not Connected</p>
                  <p className="text-xs text-muted-foreground/80">
                    Connect to a database to start querying.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="db-type" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Type</Label>
              <Select value={dbType} onValueChange={handleDbTypeChange}>
                <SelectTrigger id="db-type" className="h-10 bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all hover:bg-muted/50">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent className="border-0 shadow-xl bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="postgresql" className="focus:bg-accent cursor-pointer">PostgreSQL</SelectItem>
                  <SelectItem value="mysql" className="focus:bg-accent cursor-pointer">MySQL</SelectItem>
                  <SelectItem value="sqlite" className="focus:bg-accent cursor-pointer">SQLite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dbType === "sqlite" ? (
              <div className="space-y-2">
                <Label htmlFor="path" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Path</Label>
                <Input
                  id="path"
                  type="text"
                  placeholder="/path/to/database.db"
                  value={credentials.path}
                  onChange={(e) =>
                    setCredentials({ ...credentials, path: e.target.value })
                  }
                  className="bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg h-10 transition-all hover:bg-muted/50"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="host" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Host</Label>
                    <Input
                      id="host"
                      type="text"
                      placeholder="localhost"
                      value={credentials.host}
                      onChange={(e) =>
                        setCredentials({ ...credentials, host: e.target.value })
                      }
                      className="bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg h-10 transition-all hover:bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      placeholder={dbType === "postgresql" ? "5432" : "3306"}
                      value={credentials.port}
                      onChange={(e) =>
                        setCredentials({ ...credentials, port: e.target.value })
                      }
                      className="bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg h-10 transition-all hover:bg-muted/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Database Name</Label>
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
                    className="bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg h-10 transition-all hover:bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Username</Label>
                  <Input
                    id="user"
                    type="text"
                    placeholder="username"
                    value={credentials.user}
                    onChange={(e) =>
                      setCredentials({ ...credentials, user: e.target.value })
                    }
                    className="bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg h-10 transition-all hover:bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Password</Label>
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
                    className="bg-muted/30 border-0 focus:ring-1 focus:ring-primary/20 rounded-lg h-10 transition-all hover:bg-muted/50"
                  />
                </div>
              </>
            )}

            <Button
              onClick={handleConnect}
              disabled={!isFormValid() || isLoading}
              className="w-full h-10 mt-4 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : connected ? (
                "Reconnect"
              ) : (
                "Connect Database"
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>

      <div className="pt-4 border-t border-dashed border-border/40 mt-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground px-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Quick Tip</p>
            <p>Use natural language to query.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
