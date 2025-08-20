export default function AdminPage() {
  const region = { name: "South Sound", pods: 2, activity: "Moderate", skillsGaps: ["Spanish", "Court Watch"] };
  return (
    <section>
      <h1 className="text-2xl font-bold">Regional Admin</h1>
      <div className="grid gap-2 mt-4">
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">{region.name}</div>
          <div className="text-sm text-muted-foreground">Pods: {region.pods} • Activity: {region.activity}</div>
          <div className="text-sm mt-2">Skills gaps: {region.skillsGaps.join(", ")}</div>
        </div>
      </div>
    </section>
  );
}