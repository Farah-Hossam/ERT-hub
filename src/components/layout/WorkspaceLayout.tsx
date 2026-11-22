import type { ReactNode } from "react";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
      <MobileNavigation />
    </div>
  );
}