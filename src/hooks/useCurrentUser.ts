"use client";

import { useEffect, useState } from "react";
import type { TeamMembership } from "@/features/team/types/team.types";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/user.types";

export function useCurrentUser() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [profileResult, membershipResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("team_memberships")
          .select("team_id, is_lead")
          .eq("profile_id", user.id),
      ]);

      if (!cancelled) {
        setProfile(profileResult.data as Profile | null);
        setMemberships((membershipResult.data ?? []) as TeamMembership[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, memberships, loading };
}
