export default function WatchPage() {
  const reports = [
    { id: "r-101", time: "2025-08-17 18:40", summary: "Helicopter circling SE", geo: "47.04,-122.89" },
    { id: "r-102", time: "2025-08-17 19:10", summary: "Multiple sirens W 4th Ave", geo: "47.05,-122.91" },
  ];
  return (
    <section>
      <h1 className="text-2xl font-bold">Watch</h1>
      <p className="text-muted-foreground">Public non‑PII reports routed to this region.</p>
      <div className="mt-4 grid gap-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-2xl border p-4">
            <div className="font-semibold">{r.summary}</div>
            <div className="text-sm text-muted-foreground">{r.time} • {r.geo}</div>
          </div>
        ))}
      </div>
    </section>
  );
}