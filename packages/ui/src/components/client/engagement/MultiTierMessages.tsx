"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";

// --- Urgency options ---
const URGENCY_OPTIONS = [
  "Immediately",
  "Within 30 Minutes",
  "Within 1 Hour",
  "Within 2 Hours",
  "Later Today",
  "Within A Day",
  "Within the Week",
];

// --- Component ---
export function MultiTierMessages({
  msgs,
  urgency,
  setUrgency,
}: {
  msgs: { callout: string; detailed: string; medium: string; tldr: string };
  urgency: string;
  setUrgency: (u: string) => void;
}) {
  const [copiedTier, setCopiedTier] = useState<string | null>(null);

  const handleCopy = async (text: string, tier: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTier(tier);
    setTimeout(() => setCopiedTier(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 items-center">
        <Select onValueChange={setUrgency} value={urgency}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select urgency..." />
          </SelectTrigger>
          <SelectContent>
            {URGENCY_OPTIONS.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(["callout", "detailed", "medium", "tldr"] as const).map((tier) => (
        <div key={tier} className="bg-muted p-4 rounded space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="capitalize font-semibold">{tier} message</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(msgs[tier], tier)}
            >
              {copiedTier === tier ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="text-sm whitespace-pre-wrap">{msgs[tier]}</pre>
        </div>
      ))}
    </div>
  );
}
