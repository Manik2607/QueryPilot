"use client";

import { Database } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              QueryPilot
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              AI Database Assistant
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
