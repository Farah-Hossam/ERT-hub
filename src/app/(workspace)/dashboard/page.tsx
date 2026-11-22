import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Welcome to ERT Hub.</p>
      </div>
      <Card>
        <p className="text-sm text-muted">Dashboard widgets will go here.</p>
      </Card>
    </div>
  );
}