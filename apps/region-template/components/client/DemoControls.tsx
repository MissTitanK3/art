"use client";
import { useState, useTransition } from "react";

export function DemoControls() {
  const [pending, start] = useTransition();
  const [scenario, setScenario] = useState<"default" | "busy">("default");

  return (
    <div className="flex items-center gap-2 text-xs">
      <select
        className="rounded px-2 py-1 border"
        value={scenario}
        onChange={e => setScenario(e.target.value as any)}
        title="Load a pre-baked scenario"
      >
        <option value="default">Scenario: Default</option>
        <option value="busy">Scenario: Busy board</option>
      </select>
      <a className="underline" href="?ephemeral" title="Session-only memory">Ephemeral mode</a>
    </div>
  );
}
