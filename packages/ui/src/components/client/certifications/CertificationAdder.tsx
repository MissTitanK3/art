"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { usePodsStore } from "@workspace/store/podStore";
import type { CertificationLevel } from "@workspace/store/types/pod.ts";

export function CertificationAdder({
  podId,
  rosterId,
  defaultLevel = "in_progress",
}: {
  podId: string;
  rosterId: string;
  defaultLevel?: CertificationLevel;
}) {
  const addCertification = usePodsStore((s) => s.addCertification);
  const [name, setName] = React.useState("");

  function handleAdd() {
    if (!name.trim()) return;

    addCertification(podId, rosterId, {
      id: crypto.randomUUID(),
      display_name: name.trim(),
      level: defaultLevel,
    });

    setName(""); // clear input after adding
  }

  return (
    <div className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Certification name (e.g. Medic Basic)"
        className="flex-1"
      />
      <Button type="button" onClick={handleAdd} disabled={!name.trim()}>
        Add
      </Button>
    </div>
  );
}
