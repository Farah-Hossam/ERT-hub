"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { StatisticsCards } from "@/features/dashboard/components/StatisticsCards";
import { useEvents } from "@/features/events/hooks/useEvents";
import { BlockersWidget } from "@/features/reports/components/BlockersWidget";
import { MissingReportsWidget } from "@/features/reports/components/MissingReportsWidget";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { ReportDetails } from "@/features/reports/components/ReportDetails";
import { ReportForm } from "@/features/reports/components/ReportForm";
import { useActiveMembers } from "@/features/reports/hooks/useActiveMembers";
import { useReports } from "@/features/reports/hooks/useReports";
import { getTeamStats } from "@/features/reports/snapshot";
import type { Report } from "@/features/reports/types/report.types";
import {
  currentWeekStart,
  formatWeekRange,
  shiftWeek,
} from "@/features/reports/utils";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useTeams } from "@/features/team/hooks/useTeams";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  canReviewReports,
  canViewTeamReports,
  isTopBoard,
  manageableTeams,
} from "@/lib/access";

export default function ReportsPage() {
  const { profile, memberships } = useCurrentUser();
  const { teams } = useTeams();
  const { reports, loading, error, save, review } = useReports();
  const { tasks } = useTasks();
  const { events } = useEvents();

  const [weekStart, setWeekStart] = useState(() => currentWeekStart());
  // null = form closed; { report: null } = writing a new report
  const [formState, setFormState] = useState<{ report: Report | null } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canViewTeam = canViewTeamReports(profile, memberships);
  const canReview = canReviewReports(profile, memberships);
  const allMembers = useActiveMembers(canViewTeam);

  // The people whose reports you oversee: everyone for the top board,
  // otherwise the members of the teams you manage
  const members = useMemo(() => {
    if (!profile) return [];
    if (isTopBoard(profile)) return allMembers;
    const managed = new Set(manageableTeams(profile, memberships, teams).map((t) => t.id));
    return allMembers.filter((m) => m.team_ids.some((id) => managed.has(id)));
  }, [profile, memberships, teams, allMembers]);

  const thisWeek = currentWeekStart();
  const myReports = useMemo(
    () => (profile ? reports.filter((r) => r.author_id === profile.id) : []),
    [reports, profile]
  );
  const myThisWeek = myReports.find((r) => r.week_start === thisWeek) ?? null;

  // The member's last submitted report before the week being written,
  // used to show how far each task has moved since then
  const formWeek = formState?.report?.week_start ?? thisWeek;
  const previousSnapshot = useMemo(() => {
    const previous = myReports.find(
      (r) => r.week_start < formWeek && r.status !== "draft" && r.snapshot
    );
    return previous?.snapshot ?? null;
  }, [myReports, formWeek]);

  const teamWeekReports = reports.filter(
    (r) => r.week_start === weekStart && r.status !== "draft"
  );

  const selected = reports.find((r) => r.id === selectedId) ?? null;
  const canReviewSelected =
    canReview && !!selected && !!profile && selected.author_id !== profile.id;

  function openReport(report: Report) {
    // Your own drafts open in the editor, everything else opens to read
    if (profile && report.author_id === profile.id && report.status === "draft") {
      setFormState({ report });
    } else {
      setSelectedId(report.id);
    }
  }

  function handleMainButton() {
    if (!myThisWeek) setFormState({ report: null });
    else if (myThisWeek.status === "draft") setFormState({ report: myThisWeek });
    else setSelectedId(myThisWeek.id);
  }

  const mainButtonText = !myThisWeek
    ? "Create this week's report"
    : myThisWeek.status === "draft"
      ? "Continue draft"
      : "View this week's report";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Weekly Reports</h1>
          <p className="text-sm text-muted">
            {loading
              ? "Loading..."
              : "Built automatically from your tasks. Add notes only if you need to."}
          </p>
        </div>
        {profile && (
          <Button onClick={handleMainButton}>
            <FilePenLine size={16} />
            {mainButtonText}
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600">Could not load reports: {error}</p>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          My reports
        </h2>
        {!loading && myReports.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">You haven&apos;t created a report yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myReports.map((report) => (
              <ReportCard key={report.id} report={report} onOpen={() => openReport(report)} />
            ))}
          </div>
        )}
      </section>

      {canViewTeam && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Team reports
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous week"
                onClick={() => setWeekStart(shiftWeek(weekStart, -1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="min-w-44 text-center text-sm font-medium">
                {formatWeekRange(weekStart)}
              </span>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next week"
                disabled={weekStart >= thisWeek}
                onClick={() => setWeekStart(shiftWeek(weekStart, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <StatisticsCards stats={getTeamStats(teamWeekReports, members.length)} loading={false} />

          <div className="grid gap-4 lg:grid-cols-2">
            <MissingReportsWidget
              members={members}
              weekReports={teamWeekReports}
              weekStart={weekStart}
              isCurrentWeek={weekStart === thisWeek}
              tasks={tasks}
              events={events}
            />
            <BlockersWidget reports={teamWeekReports} />
          </div>

          {teamWeekReports.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teamWeekReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  showAuthor
                  onOpen={() => openReport(report)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <Modal
        open={formState !== null}
        onClose={() => setFormState(null)}
        title="Weekly report"
        size="lg"
        closeOnBackdrop={false}
      >
        {formState && profile && (
          <ReportForm
            report={formState.report}
            weekStart={formWeek}
            userId={profile.id}
            tasks={tasks}
            events={events}
            previous={previousSnapshot}
            onCancel={() => setFormState(null)}
            onSubmit={async (data, snapshot, submit) => {
              await save({
                id: formState.report?.id,
                week_start: formWeek,
                data,
                snapshot,
                submit,
              });
              setFormState(null);
            }}
          />
        )}
      </Modal>

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title="Report" size="lg">
        {selected && (
          <ReportDetails
            key={selected.id}
            report={selected}
            canReview={canReviewSelected}
            onClose={() => setSelectedId(null)}
            onReview={async (feedback) => {
              await review(selected.id, feedback);
              setSelectedId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
