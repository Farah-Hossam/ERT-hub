export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-brand">ERT Hub</h1>
      <p className="text-muted">Engineering Operations Workspace</p>
      <div className="rounded-xl border border-border bg-surface p-6">
        <button className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark">
          Test button
        </button>
      </div>
    </main>
  );
}