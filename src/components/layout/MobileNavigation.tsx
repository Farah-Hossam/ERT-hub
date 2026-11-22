"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { navSections } from "@/config/navigation";
import { cn } from "@/lib/utils";

const allItems = navSections.flatMap((section) => section.items);

// The most-used pages get a spot on the bar; everything else goes under "More"
const primaryHrefs = ["/dashboard", "/tasks", "/projects", "/calendar"];
const shortLabels: Record<string, string> = { "/dashboard": "Home" };

const primaryItems = allItems.filter((item) => primaryHrefs.includes(item.href));
const moreItems = allItems.filter((item) => !primaryHrefs.includes(item.href));

export function MobileNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const moreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div className="fixed inset-x-3 bottom-20 z-30 rounded-xl border border-border bg-surface p-2 shadow-lg md:hidden">
          <ul className="grid grid-cols-2 gap-1">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive(item.href)
                        ? "bg-brand/10 text-brand"
                        : "text-foreground hover:bg-surface-secondary"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-border bg-surface md:hidden">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium",
                isActive(item.href) ? "text-brand" : "text-muted"
              )}
            >
              <Icon size={20} />
              {shortLabels[item.href] ?? item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium",
            moreOpen || moreActive ? "text-brand" : "text-muted"
          )}
        >
          <Ellipsis size={20} />
          More
        </button>
      </nav>
    </>
  );
}