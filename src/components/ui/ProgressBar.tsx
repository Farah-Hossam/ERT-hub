import { cn } from "@/lib/utils";

type Variant = "brand" | "success" | "warning" | "danger";

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  variant?: Variant;
  className?: string;
}

const barStyles: Record<Variant, string> = {
  brand: "bg-brand",
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-red-700",
};

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  variant = "brand",
  className,
}: ProgressBarProps) {
  // Keep the value between 0 and 100, even if bad data comes in
  const safeValue = Math.min(100, Math.max(0, Math.round(value) || 0));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted">{label}</span>
          {showPercentage && (
            <span className="font-semibold">{safeValue}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary"
      >
        <div
          className={cn("h-full rounded-full transition-all", barStyles[variant])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}