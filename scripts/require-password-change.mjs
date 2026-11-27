// Makes people choose their own password the next time they open the app.
// Use it for accounts that were created with a temporary password.
//
//   Preview:   node --env-file=.env.local scripts/require-password-change.mjs
//   For real:  node --env-file=.env.local scripts/require-password-change.mjs --apply
//
// Options:
//   --include-admins         also include admins (they are skipped by default)
//   --never-signed-in-only   only people who have never logged in yet
//
// Safe to run again: people already marked are skipped.

import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";

export async function requirePasswordChange({ admin, apply, includeAdmins, neverOnly, log = console.log }) {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`reading accounts: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  const { data: profiles, error: profileError } = await admin.from("profiles").select("id, role, full_name");
  if (profileError) throw new Error(`reading profiles: ${profileError.message}`);
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const targets = users.filter((u) => {
    if (u.user_metadata?.must_change_password === true) return false; // already marked
    if (!includeAdmins && profileById.get(u.id)?.role === "admin") return false;
    if (neverOnly && u.last_sign_in_at) return false;
    return true;
  });

  log(`${users.length} accounts in total, ${targets.length} to mark.`);
  for (const u of targets) {
    const name = profileById.get(u.id)?.full_name || "(no name)";
    log(`  ${name} <${u.email}>  last sign-in: ${u.last_sign_in_at ? u.last_sign_in_at.slice(0, 10) : "never"}`);
  }

  if (!apply) {
    log("\nDRY RUN: nothing was changed. Run again with --apply to do it for real.");
    return { marked: 0, failed: 0 };
  }

  let marked = 0;
  let failed = 0;
  for (const u of targets) {
    // Keep the other details stored with the account (such as the name)
    const { error } = await admin.auth.admin.updateUserById(u.id, {
      user_metadata: { ...(u.user_metadata ?? {}), must_change_password: true },
    });
    if (error) {
      failed++;
      log(`  FAILED ${u.email}: ${error.message}`);
    } else {
      marked++;
    }
  }
  log(`\nDone. Marked ${marked}${failed ? `, ${failed} failed` : ""}.`);
  return { marked, failed };
}

// Only run when started from the command line, not when imported by a test
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
    process.exit(1);
  }
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  try {
    const { failed } = await requirePasswordChange({
      admin,
      apply: args.includes("--apply"),
      includeAdmins: args.includes("--include-admins"),
      neverOnly: args.includes("--never-signed-in-only"),
    });
    if (failed > 0) process.exit(1);
  } catch (e) {
    console.error(`Stopped: ${e.message}`);
    process.exit(1);
  }
}
