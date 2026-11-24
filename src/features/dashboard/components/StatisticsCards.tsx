import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "../utils";

const toneStyles: Record<DashboardStat["tone"], string> = {
  neutral: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  danger: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
};

interface StatisticsCardsProps {
  stats: DashboardStat[];
  loading: boolean;
}

export function StatisticsCards({ stats, loading }: StatisticsCardsProps) {
  const items: DashboardStat[] = loading
    ? ["Tasks", "Completed", "Overdue", "Due"].map((label) => ({
        label,
        value: 0,
        tone: "neutral" as const,
      }))
    : stats;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((stat) => (
        <Card key={stat.label}>
          <p className="text-sm text-muted">{stat.label}</p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold",
              // Red and amber only matter when there is something to see
              stat.value === 0 && stat.tone !== "success"
                ? toneStyles.neutral
                : toneStyles[stat.tone]
            )}
          >
            {loading ? "–" : stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
