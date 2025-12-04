"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { Label } from "@workspace/ui/primitives/label";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/primitives/collapsible";
import type { DispatchUpdate } from "@workspace/store/types/dispatch";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

type AfterActionReportGuideProps = {
  onAddUpdate: (update: Omit<DispatchUpdate, "id" | "createdAt">) => void;
};

export default function AfterActionReportGuide({
  onAddUpdate,
}: AfterActionReportGuideProps) {
  const [reporterName, setReporterName] = useState("");
  const [roses, setRoses] = useState("");
  const [thorns, setThorns] = useState("");
  const [growth, setGrowth] = useState("");
  const [techNotes, setTechNotes] = useState("");
  const [open, setOpen] = useState(false);

  const hasReflectionContent =
    Boolean(roses.trim()) ||
    Boolean(thorns.trim()) ||
    Boolean(growth.trim()) ||
    Boolean(techNotes.trim());
  const hasAnyInput = hasReflectionContent || Boolean(reporterName.trim());

  const resetFields = () => {
    setReporterName("");
    setRoses("");
    setThorns("");
    setGrowth("");
    setTechNotes("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasReflectionContent) {
      toast.error("Add at least one rose, thorn, or growth item.");
      return;
    }

    const trimmedName = reporterName.trim();
    const author = trimmedName.length > 0 ? trimmedName : "Anonymous Reporter";

    const reportSections = [
      "📋 After Action Report",
      trimmedName.length > 0
        ? `Reporter: ${trimmedName}`
        : "Reporter: Anonymous",
      roses.trim() ? `🌹 Roses\n${roses.trim()}` : null,
      thorns.trim() ? `🌵 Thorns\n${thorns.trim()}` : null,
      growth.trim() ? `🌱 Growth\n${growth.trim()}` : null,
      techNotes.trim() ? `🛠️ Tech Needs & Requests\n${techNotes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    onAddUpdate({ author, text: reportSections });
    toast.success("After Action Report logged.");
    resetFields();
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border bg-muted/40 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">After Action Report</h3>
            <p className="text-xs text-muted-foreground">
              Capture roses, thorns, growth, and technical follow-ups. Leave
              your name blank to report anonymously.
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-expanded={open}
              className="inline-flex items-center gap-1 rounded-md border border-dashed px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              {open ? "Hide form" : "Add AAR"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
              />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-3">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="aar-reporter">Reporter name (optional)</Label>
              <Input
                id="aar-reporter"
                placeholder="Leave blank to stay anonymous"
                value={reporterName}
                onChange={(event) => setReporterName(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="aar-roses">Roses — what went well</Label>
              <Textarea
                id="aar-roses"
                placeholder="Wins, support moments, bright spots..."
                value={roses}
                onChange={(event) => setRoses(event.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="aar-thorns">
                Thorns — pain points or blockers
              </Label>
              <Textarea
                id="aar-thorns"
                placeholder="Friction points, risks, what hindered impact..."
                value={thorns}
                onChange={(event) => setThorns(event.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="aar-growth">Growth — what to try next time</Label>
              <Textarea
                id="aar-growth"
                placeholder="Experiments, follow-ups, skills to build..."
                value={growth}
                onChange={(event) => setGrowth(event.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="aar-tech">
                Technical bugs or feature requests (optional)
              </Label>
              <Textarea
                id="aar-tech"
                placeholder="Tools that broke, wishlist improvements, integrations..."
                value={techNotes}
                onChange={(event) => setTechNotes(event.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFields}
                disabled={!hasAnyInput}
              >
                Clear
              </Button>
              <Button type="submit" size="sm" disabled={!hasReflectionContent}>
                Log report
              </Button>
            </div>
          </form>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
