export default function SettingsPage() {
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-3 mt-4">
        <label className="grid gap-1"><span className="text-sm">Time Zone</span>
          <select className="input"><option>America/Los_Angeles</option></select>
        </label>
        <label className="grid gap-1"><span className="text-sm">Notifications</span>
          <select className="input"><option>Critical Only</option><option>All</option></select>
        </label>
        <button className="btn">Save (no-op)</button>
      </div>
    </section>
  );
}