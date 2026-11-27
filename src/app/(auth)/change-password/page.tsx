"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 8;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // Refresh the login so the app knows the change is done
    await supabase.auth.refreshSession();
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-3xl font-bold">
          <span className="text-brand">ERT</span> HUB
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          Welcome! Choose your own password to continue.
        </p>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="New password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              hint={`At least ${MIN_LENGTH} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Repeat the new password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={error}
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show passwords
            </label>
            <Button type="submit" loading={saving}>
              Save and continue
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
