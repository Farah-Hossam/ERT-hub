import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  required,
  className,
  id,
  ...props
}: InputProps) {
  // Unique id so the label is linked to its input
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground",
            "placeholder:text-muted transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error ? "border-red-600" : "border-border",
            className
          )}
          {...props}
        />
      </div>

      {(error || hint) && (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-red-600" : "text-muted")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}