"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-6">
      <div className="w-full max-w-md">
        <Input placeholder="Search tasks, projects..." icon={<Search size={16} />} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
        >
          <Bell size={18} />
        </button>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
          aria-label="Profile"
        >
          FH
        </div>
      </div>
    </header>
  );
}