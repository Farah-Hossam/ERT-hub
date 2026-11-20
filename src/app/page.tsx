import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold text-brand">ERT Hub</h1>

      <Card className="flex flex-col gap-5">
        <ProgressBar value={20} label="Steering column design" />
        <ProgressBar value={60} label="Chassis welding" variant="warning" />
        <ProgressBar value={100} label="Brake test report" variant="success" />
        <ProgressBar value={35} label="Late: battery pack" variant="danger" />
        <ProgressBar value={140} label="Bad data (clamped to 100)" />
        <ProgressBar value={45} showPercentage={false} />
      </Card>
    </main>
  );
}