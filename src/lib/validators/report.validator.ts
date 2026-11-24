import type { ReportFormData } from "@/features/reports/types/report.types";

export type ReportFormErrors = Partial<
  Record<Exclude<keyof ReportFormData, "task_notes">, string>
>;

const MAX_LENGTH = 4000;

// Every note is optional now, because the report fills itself in.
// We only stop absurdly long text.
export function validateReportForm(data: ReportFormData): ReportFormErrors {
  const errors: ReportFormErrors = {};

  const fields = [
    "accomplished",
    "challenges",
    "blockers",
    "help_needed",
    "next_week",
  ] as const;
  for (const field of fields) {
    if (data[field].length > MAX_LENGTH) {
      errors[field] = `Keep this under ${MAX_LENGTH} characters`;
    }
  }

  return errors;
}
