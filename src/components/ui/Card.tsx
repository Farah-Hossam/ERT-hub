import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Padding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  interactive?: boolean;
}

const paddingStyles: Record<Padding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Card({
  padding = "md",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface",
        paddingStyles[padding],
        interactive && "cursor-pointer transition-colors hover:border-brand",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}