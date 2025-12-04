"use client";

import * as React from "react";
import { toast } from "sonner";
import type {
  DispatchImpactMetrics,
  DispatchStatus,
  ImpactRiskLevel,
} from "@workspace/store/types/dispatch";
import { Input } from "@workspace/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Alert, AlertDescription } from "@workspace/ui/primitives/alert";
import { Button } from "@workspace/ui/primitives/button";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/primitives/tooltip";

type Props = {
  dispatchId: string;
  status: DispatchStatus;
  initialMetrics?: Partial<DispatchImpactMetrics>;
};

const RISK_LEVEL_DETAILS: {
  value: ImpactRiskLevel;
  label: string;
  description: string;
  tone: string;
}[] = [
  {
    value: "unknown",
    label: "Unknown",
    description: "Risk not yet assessed.",
    tone: "bg-muted text-foreground",
  },
  {
    value: "low",
    label: "Low",
    description: "Routine follow-up, minimal escalation expected.",
    tone: "bg-emerald-100 text-emerald-900",
  },
  {
    value: "medium",
    label: "Medium",
    description:
      "Heightened monitoring. Field team should check-in frequently.",
    tone: "bg-amber-100 text-amber-900",
  },
  {
    value: "high",
    label: "High",
    description:
      "Elevated threat to neighbors or volunteers. Dispatchers actively coordinating response.",
    tone: "bg-orange-100 text-orange-900",
  },
  {
    value: "critical",
    label: "Critical",
    description:
      "Life safety, deportation risk, or severe state violence confirmed.",
    tone: "bg-red-100 text-red-900",
  },
];

type DraftMetrics = {
  people_served: number;
  resources_distributed: number;
  risk_level: ImpactRiskLevel;
};

export function ImpactMetricsPanel({
  dispatchId,
  status,
  initialMetrics,
}: Props) {
  const [metrics, setMetrics] = React.useState<DispatchImpactMetrics | null>(
    null
  );
  const [draft, setDraft] = React.useState<DraftMetrics>({
    people_served: 0,
    resources_distributed: 0,
    risk_level: "unknown",
  });
  const [loading, setLoading] = React.useState(!initialMetrics);
  const [error, setError] = React.useState<string | null>(null);
  const [savingField, setSavingField] = React.useState<string | null>(null);
  const disabled = status === "verified_complete";
  const peopleInputId = React.useId();
  const resourcesInputId = React.useId();
  const riskSelectId = React.useId();

  const fetchMetrics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/impact/dispatches/${dispatchId}/metrics`);
      if (!res.ok) throw new Error("Unable to load impact metrics");
      const json = (await res.json()) as DispatchImpactMetrics;
      setMetrics(json);
      setDraft({
        people_served: json.people_served,
        resources_distributed: json.resources_distributed,
        risk_level: json.risk_level,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load impact metrics"
      );
    } finally {
      setLoading(false);
    }
  }, [dispatchId]);

  React.useEffect(() => {
    if (!initialMetrics) return;
    const next: DispatchImpactMetrics = {
      dispatch_id: dispatchId,
      people_served: initialMetrics.people_served ?? 0,
      resources_distributed: initialMetrics.resources_distributed ?? 0,
      risk_level: (initialMetrics.risk_level ?? "unknown") as ImpactRiskLevel,
      updated_at: initialMetrics.updated_at ?? null,
      updated_by: initialMetrics.updated_by ?? null,
    };
    setMetrics(next);
    setDraft({
      people_served: next.people_served,
      resources_distributed: next.resources_distributed,
      risk_level: next.risk_level,
    });
    setLoading(false);
  }, [dispatchId, initialMetrics]);

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  React.useEffect(() => {
    if (!metrics) return;
    setDraft({
      people_served: metrics.people_served,
      resources_distributed: metrics.resources_distributed,
      risk_level: metrics.risk_level,
    });
  }, [metrics]);

  const saveMetrics = async (
    patch: Partial<DispatchImpactMetrics>,
    field: string
  ) => {
    try {
      setSavingField(field);
      const res = await fetch(`/api/impact/dispatches/${dispatchId}/metrics`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const message = (await res.json())?.error;
        throw new Error(message ?? "Unable to update impact metrics");
      }
      const json = (await res.json()) as DispatchImpactMetrics;
      setMetrics(json);
      toast.success("Impact metrics saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update impact metrics"
      );
      setError(
        err instanceof Error ? err.message : "Unable to update impact metrics"
      );
    } finally {
      setSavingField(null);
    }
  };

  const currentRisk = RISK_LEVEL_DETAILS.find(
    (detail) => detail.value === (draft.risk_level as ImpactRiskLevel)
  );

  return (
    <TooltipProvider>
      <section className="rounded-lg border bg-card/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Impact Metrics
            </p>
            <p className="text-xs text-muted-foreground">
              People helped, resources moved, and perceived risk.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>
              {metrics?.updated_at
                ? `Updated ${new Date(metrics.updated_at).toLocaleString()}`
                : "Not updated yet"}
            </p>
            {metrics?.updated_by ? (
              <p>by {metrics.updated_by.slice(0, 8)}…</p>
            ) : null}
          </div>
        </div>

        {disabled ? (
          <Alert className="mt-3 text-xs">
            <AlertDescription>
              Dispatch marked verified_complete. Unlock to make edits.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="mt-3 text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor={peopleInputId}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
            >
              People served
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 text-muted-foreground"
                  >
                    ?
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Count unique individuals reached with direct support (legal,
                  mutual aid, accompaniment, etc.).
                </TooltipContent>
              </Tooltip>
            </label>
            <Input
              id={peopleInputId}
              type="number"
              min={0}
              value={draft.people_served}
              disabled={disabled || loading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  people_served: Number(event.target.value || 0),
                }))
              }
              onBlur={() => {
                if (disabled) return;
                if (metrics?.people_served === draft.people_served) return;
                saveMetrics(
                  { people_served: Math.max(0, draft.people_served) },
                  "people_served"
                );
              }}
            />
          </div>
          <div>
            <label
              htmlFor={resourcesInputId}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
            >
              Resources distributed
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 text-muted-foreground"
                  >
                    ?
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Track discrete supply units delivered (meal kits, gallons of
                  water, hygiene packs, etc.).
                </TooltipContent>
              </Tooltip>
            </label>
            <Input
              id={resourcesInputId}
              type="number"
              min={0}
              value={draft.resources_distributed}
              disabled={disabled || loading}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  resources_distributed: Number(event.target.value || 0),
                }))
              }
              onBlur={() => {
                if (disabled) return;
                if (
                  metrics?.resources_distributed === draft.resources_distributed
                )
                  return;
                saveMetrics(
                  {
                    resources_distributed: Math.max(
                      0,
                      draft.resources_distributed
                    ),
                  },
                  "resources_distributed"
                );
              }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label
            htmlFor={riskSelectId}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
          >
            Risk level
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 text-muted-foreground"
                >
                  ?
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Set how urgent or dangerous this dispatch remains after
                verification.
              </TooltipContent>
            </Tooltip>
          </label>
          <Select
            value={draft.risk_level as ImpactRiskLevel}
            onValueChange={(value) => {
              setDraft((prev) => ({
                ...prev,
                risk_level: value as ImpactRiskLevel,
              }));
              if (!disabled)
                saveMetrics(
                  { risk_level: value as ImpactRiskLevel },
                  "risk_level"
                );
            }}
            disabled={disabled || loading}
          >
            <SelectTrigger id={riskSelectId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVEL_DETAILS.map((risk) => (
                <SelectItem key={risk.value} value={risk.value}>
                  {risk.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentRisk ? (
            <div className={`rounded-md px-3 py-2 text-xs ${currentRisk.tone}`}>
              {currentRisk.description}
            </div>
          ) : null}
        </div>

        {savingField ? (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving changes…
          </p>
        ) : null}
      </section>
    </TooltipProvider>
  );
}
