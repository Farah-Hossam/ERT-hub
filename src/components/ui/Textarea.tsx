import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  required,
  className,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = `${textareaId}-message`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className={cn(
          "w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-600" : "border-border",
          className
        )}
        {...props}
      />
      {error && (
        <p id={messageId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
