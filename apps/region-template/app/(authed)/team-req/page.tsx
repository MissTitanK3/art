"use client";
import { useState } from "react";

export default function TeamRequestPage() {
  const [form, setForm] = useState({ role: "Legal Support", needed: 2, urgency: "Within 24h", notes: "Court watcher coverage" });
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-bold">Team Request</h1>
      <p className="text-muted-foreground mb-4">Submit a request for support (dummy-only).</p>
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Role Needed</span>
          <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm"># Needed</span>
          <input className="input" type="number" value={form.needed} onChange={(e) => setForm({ ...form, needed: Number(e.target.value) })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Urgency</span>
          <select className="input" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
            <option>Immediate</option>
            <option>Within 24h</option>
            <option>Within a week</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Notes</span>
          <textarea className="input min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <button className="btn">Submit (no-op)</button>
      </div>
    </section>
  );
}