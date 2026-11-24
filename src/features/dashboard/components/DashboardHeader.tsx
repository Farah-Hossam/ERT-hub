import type { Profile } from "@/types/user.types";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// The greeting uses the clock, so it only shows once the profile has loaded
// in the browser (this avoids a server/browser mismatch).
export function DashboardHeader({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Welcome to ERT Hub.</p>
      </div>
    );
  }

  const name = profile.full_name.trim().split(/\s+/)[0] || profile.email || "";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {greeting()}, {name}
      </h1>
      <p className="text-sm text-muted">{today}</p>
    </div>
  );
}
