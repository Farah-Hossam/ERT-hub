"use client";

import { Card } from "@/components/ui/Card";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatisticsCards } from "@/features/dashboard/components/StatisticsCards";
import { TaskListWidget } from "@/features/dashboard/components/TaskListWidget";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";

export default function DashboardPage() {
  const { profile, scope, loading, error, stats, myTasks, upcoming, attention } =
    useDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader profile={profile} />

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load tasks: {error}</p>
        </Card>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          {scope === "team" ? "Team overview" : "My overview"}
        </p>
        <StatisticsCards stats={stats} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TaskListWidget
          title="My tasks"
          tasks={myTasks}
          loading={loading}
          emptyText="Nothing assigned to you right now."
        />
        <TaskListWidget
          title="Upcoming deadlines"
          tasks={upcoming}
          loading={loading}
          emptyText="No upcoming deadlines."
        />
        <TaskListWidget
          title="Needs attention"
          tasks={attention}
          loading={loading}
          emptyText="Nothing is blocked or overdue."
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
