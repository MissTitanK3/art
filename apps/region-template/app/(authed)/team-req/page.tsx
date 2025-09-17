"use client";
import { useState } from "react";
import TeamRequestForm from "@workspace/ui/components/client/team-request/TeamRequestForm";

export default function TeamRequestPage() {
  const [form, setForm] = useState({ role: "Legal Support", needed: 2, urgency: "Within 24h", notes: "Court watcher coverage" });
  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-bold">Team Request</h1>
      <p className="text-muted-foreground mb-4">Submit a request for support (dummy-only).</p>
      <div className="grid gap-3">
        <TeamRequestForm onSubmitted={() => alert("Submitted! (not really, this is a dummy)")} />
      </div>
    </section>
  );
}