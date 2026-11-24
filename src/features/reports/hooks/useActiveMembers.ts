"use client";

import { useEffect, useState } from "react";
import { getActiveMembers } from "../services/reportService";
import type { ActiveMember } from "../types/report.types";

export function useActiveMembers(enabled: boolean) {
  const [members, setMembers] = useState<ActiveMember[]>([]);

  useEffect(() => {
    if (!enabled) return;
    getActiveMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [enabled]);

  return members;
}
