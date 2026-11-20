"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function Home() {
  const [email, setEmail] = useState("");
  const showError = email.length > 0 && !email.includes("@");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-brand">ERT Hub</h1>

      <Card className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@ejust.edu.eg"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={showError ? "Enter a valid email address" : undefined}
          hint={!showError ? "Use your university email" : undefined}
        />
        <Input label="Task name" placeholder="Design the steering column" />
        <Input label="Locked field" value="Cannot edit" disabled readOnly />
        <Button>Continue</Button>
      </Card>
    </main>
  );
}