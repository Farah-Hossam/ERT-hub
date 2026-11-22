"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  const router = useRouter();
  const { profile } = useCurrentUser();
  const displayName = profile?.full_name || profile?.email || "";

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-6">
      <div className="w-full max-w-md">
        <Input placeholder="Search tasks, projects..." icon={<Search size={16} />} />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
        >
          <LogOut size={18} />
        </button>
        <div
          title={displayName}
          aria-label="Profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
        >
          {displayName ? getInitials(displayName) : ""}
        </div>
      </div>
    </header>
  );
}