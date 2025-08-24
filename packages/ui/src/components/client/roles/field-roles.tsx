// components/roles/field-roles.tsx
"use client";

import * as React from "react";
import { Check, X, ShieldAlert, Search } from "lucide-react";
import {
  FIELD_ROLE_DETAILS,
  FIELD_ROLE_LABELS,
  FIELD_ROLE_OPTIONS,
  FIELD_ROLE_TIERS,
  type FieldRole,
} from "@workspace/store/types/roles.ts";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

/* ---------- helpers ---------- */

type RiskLevel = "low" | "medium" | "high";
const LABEL = FIELD_ROLE_LABELS;
const TIER = FIELD_ROLE_TIERS;
const DETAILS = Object.fromEntries(FIELD_ROLE_DETAILS.map((d) => [d.role, d])) as Record<
  FieldRole,
  (typeof FIELD_ROLE_DETAILS)[number]
>;
const riskDot: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};
const roleRisk = (role: FieldRole): RiskLevel => (DETAILS[role]?.riskLevel ?? "low") as RiskLevel;
const byTier = (a: FieldRole, b: FieldRole) => TIER[a] - TIER[b] || LABEL[a].localeCompare(LABEL[b]);
const tierNames: Record<1 | 2 | 3 | 4, string> = { 1: "Essential", 2: "Stabilizing", 3: "Supportive", 4: "Auxiliary" };

/* ---------- Badge ---------- */

export function RoleBadge({ role, onRemove, className }: { role: FieldRole; onRemove?: () => void; className?: string }) {
  const risk = roleRisk(role);
  return (
    <Badge
      variant="secondary"
      className={cn("flex items-center gap-1 pl-2 pr-1 py-1 border border-border", className)}
    >
      <span aria-hidden className={cn("h-2 w-2 rounded-full", riskDot[risk])} />
      <span className="text-sm">{LABEL[role]}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded hover:bg-muted/60 p-0.5"
          aria-label={`Remove ${LABEL[role]}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </Badge>
  );
}

/* ---------- Display ---------- */

export function FieldRolesDisplay({
  roles,
  emptyText = "No roles yet",
  className,
}: {
  roles: FieldRole[] | null | undefined;
  emptyText?: string;
  className?: string;
}) {
  if (!roles || roles.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  const sorted = [...roles].sort(byTier);
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <TooltipProvider delayDuration={150}>
        {sorted.map((r) => (
          <Tooltip key={r}>
            <TooltipTrigger asChild>
              <span>
                <RoleBadge role={r} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-80">
              <div className="mb-1 font-medium">{LABEL[r]}</div>
              <div className="text-xs text-muted-foreground">
                <div>
                  <span className={cn("inline-block h-2 w-2 rounded-full mr-1 align-middle", riskDot[roleRisk(r)])} />
                  <span className="align-middle capitalize">{roleRisk(r)} risk</span>
                </div>
                <div className="mt-2">{DETAILS[r]?.description}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

/* ---------- Editor (no Command) ---------- */

export interface FieldRolesEditorProps {
  value: FieldRole[];
  onChange: (roles: FieldRole[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
  className?: string;
}

export function FieldRolesEditor({
  value,
  onChange,
  placeholder = "Add roles…",
  disabled,
  maxSelections,
  className,
}: FieldRolesEditorProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0); // keyboard focus
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const chosen = React.useMemo(() => new Set((value ?? []) as FieldRole[]), [value]);

  const toggle = (role: FieldRole) => {
    const next = new Set(chosen);
    if (next.has(role)) next.delete(role);
    else {
      if (maxSelections && next.size >= maxSelections) return;
      next.add(role);
    }
    onChange([...next]);
  };

  // group once
  const TIERS = [1, 2, 3, 4] as const;
  type Tier = (typeof TIERS)[number];
  const groups = React.useMemo(() => {
    const grouped: Record<Tier, FieldRole[]> = { 1: [], 2: [], 3: [], 4: [] };
    FIELD_ROLE_OPTIONS.forEach((r) => grouped[FIELD_ROLE_TIERS[r]].push(r));
    TIERS.forEach((t) =>
      grouped[t].sort((a, b) => FIELD_ROLE_TIERS[a] - FIELD_ROLE_TIERS[b] || LABEL[a].localeCompare(LABEL[b])),
    );
    return grouped;
  }, []);

  // filtered flat list with tier labels inline
  const filtered: Array<{ kind: "label"; text: string } | { kind: "item"; role: FieldRole }> = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: typeof filtered = [];
    TIERS.forEach((t) => {
      const items = groups[t].filter((r) => {
        if (!q) return true;
        const risk = roleRisk(r);
        return (
          LABEL[r].toLowerCase().includes(q) ||
          r.toLowerCase().includes(q) ||
          tierNames[t].toLowerCase().includes(q) ||
          risk.toLowerCase().includes(q)
        );
      });
      if (items.length > 0) {
        out.push({ kind: "label", text: tierNames[t] });
        items.forEach((r) => out.push({ kind: "item", role: r }));
      }
    });
    return out;
  }, [groups, query]);

  // keep the highlighted item in view
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered.length]);

  const itemCount = filtered.filter((f) => f.kind === "item").length;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    // move only across items (skip labels)
    const indices = filtered.map((f, i) => (f.kind === "item" ? i : -1)).filter((i) => i >= 0);

    if (indices.length === 0) return;
    const cur = indices.indexOf(indices.find((i) => i >= activeIndex) ?? indices[0]!);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = indices[Math.min(cur + 1, indices.length - 1)];
      setActiveIndex(next ?? 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = indices[Math.max(cur - 1, 0)];
      setActiveIndex(prev ?? 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target?.kind === "item") toggle(target.role);
    } else if (e.key === "Escape") {
      setOpen(false);
      // return focus to trigger button for accessibility
      buttonRef.current?.focus();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Selected badges list is scrollable so the trigger stays visible */}
      <div className="max-h-[28vh] overflow-y-auto pr-1 rounded-md border bg-background/50 p-2">
        <div className="flex flex-wrap gap-1.5">
          {(value ?? []).length === 0 ? (
            <span className="text-sm text-muted-foreground">No roles selected</span>
          ) : (
            value.sort(byTier).map((r) => <RoleBadge key={r} role={r} onRemove={disabled ? undefined : () => toggle(r)} />)
          )}
        </div>
      </div>

      {/* Sticky controls so the add button never disappears */}
      <div className="sticky top-0 mt-2 flex items-center gap-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 rounded">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={buttonRef}
              type="button"
              variant="outline"
              disabled={disabled}
              className="gap-2"
              onClick={() => {
                setOpen((o) => !o);
                setTimeout(() => setActiveIndex(0), 0);
              }}
            >
              <Search className="h-4 w-4" />
              {placeholder}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={6}
            className="w-[320px] p-0 overflow-hidden max-h-[50vh]"
            onKeyDown={onKeyDown}
          >
            {/* Search input */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Search roles…"
                  className={cn(
                    "w-full pl-8 pr-2 py-2 text-sm rounded-md border bg-background",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Single scrollable list */}
            <div
              ref={listRef}
              className="max-h-[56vh] overflow-y-auto overscroll-contain"
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
              role="listbox"
              aria-label="Roles"
              tabIndex={-1}
            >
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-sm text-muted-foreground">No roles found.</div>
              )}

              {filtered.map((row, idx) =>
                row.kind === "label" ? (
                  <div
                    key={`label-${row.text}-${idx}`}
                    className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground/80 select-none"
                    aria-hidden
                  >
                    {row.text}
                  </div>
                ) : (
                  <button
                    key={row.role}
                    type="button"
                    role="option"
                    aria-selected={idx === activeIndex}
                    data-index={idx}
                    className={cn(
                      "w-full px-3 py-2 flex items-center justify-between text-left",
                      "hover:bg-accent hover:text-accent-foreground",
                      idx === activeIndex && "bg-accent/70",
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => toggle(row.role)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={cn("h-2 w-2 rounded-full", riskDot[roleRisk(row.role)])} />
                      <span className="truncate">{LABEL[row.role]}</span>
                    </div>
                    {chosen.has(row.role) && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                ),
              )}
            </div>

            <Separator />
            <div className="p-2 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                disabled={disabled || (value ?? []).length === 0}
              >
                Clear all
              </Button>
              <div className="ml-auto text-xs text-muted-foreground">
                {(value ?? []).length} selected{maxSelections ? ` / ${maxSelections}` : ""}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* make the wrapper the interactive trigger */}
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled
                  aria-disabled="true"
                  tabIndex={-1} // prevent focus on the disabled button
                >
                  <ShieldAlert className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-80 z-50">
              <div className="mb-1 font-medium">Risk legend</div>
              <ul className="text-xs space-y-1">
                <li><span className="inline-block h-2 w-2 rounded-full mr-1 align-middle bg-emerald-500" />Low risk</li>
                <li><span className="inline-block h-2 w-2 rounded-full mr-1 align-middle bg-amber-500" />Medium risk</li>
                <li><span className="inline-block h-2 w-2 rounded-full mr-1 align-middle bg-rose-500" />High risk</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
    </div>
  );
}

/* ---------- RHF wrapper ---------- */
export function RHFFieldRoles<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  disabled,
  maxSelections,
}: {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: Parameters<typeof Controller<TFieldValues>>[0]["rules"];
  disabled?: boolean;
  maxSelections?: number;
}) {
  return (
    <Controller<TFieldValues, Path<TFieldValues>>
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <FieldRolesEditor
          value={(field.value ?? []) as FieldRole[]}
          onChange={field.onChange}
          disabled={disabled}
          maxSelections={maxSelections}
        />
      )}
    />
  );
}

