"use client";

import { useCallback, useEffect, useState } from "react";
import { getReports, reviewReport, saveReport } from "../services/reportService";
import type { Report, ReportFormData, ReportSnapshot } from "../types/report.types";

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setReports(await getReports());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (input: {
      id?: string;
      week_start: string;
      data: ReportFormData;
      snapshot: ReportSnapshot;
      submit: boolean;
    }) => {
      await saveReport(input);
      await refresh();
    },
    [refresh]
  );

  const review = useCallback(
    async (id: string, feedback: string) => {
      await reviewReport(id, feedback);
      await refresh();
    },
    [refresh]
  );

  return { reports, loading, error, refresh, save, review };
}
