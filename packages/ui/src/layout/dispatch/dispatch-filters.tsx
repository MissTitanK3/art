"use client";

import React from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Calendar } from "@workspace/ui/primitives/calendar";
import { Input } from "@workspace/ui/primitives/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { humanize } from "@workspace/ui/lib/utils";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch.ts";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/primitives/drawer";
import { Switch } from "@workspace/ui/primitives/switch";

type DateRange = { from?: Date; to?: Date };

type FilterOptions = {
  statuses: string[];
  types: string[];
};

type DispatchFiltersProps = {
  query: string;
  status: string;
  type: string;
  dateRange: DateRange;
  showTraining: boolean;
  options: FilterOptions;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDateRangeChange: (value: DateRange) => void;
  onClearDateRange: () => void;
  onReset: () => void;
  onToggleTraining: (value: boolean) => void;
  calendarMonths: number;
  showClear: boolean;
};

export function DispatchFilters({
  query,
  status,
  type,
  dateRange,
  showTraining,
  options,
  onQueryChange,
  onStatusChange,
  onTypeChange,
  onDateRangeChange,
  onClearDateRange,
  onReset,
  onToggleTraining,
  calendarMonths,
  showClear,
}: DispatchFiltersProps) {
  const [open, setOpen] = React.useState(false);

  const activeChips = React.useMemo(
    () =>
      buildActiveChips({
        query,
        status,
        type,
        dateRange,
        onQueryChange,
        onStatusChange,
        onTypeChange,
        onClearDateRange,
        showTraining,
        onToggleTraining,
      }),
    [
      dateRange,
      onClearDateRange,
      onQueryChange,
      onStatusChange,
      onTypeChange,
      onToggleTraining,
      query,
      showTraining,
      status,
      type,
    ]
  );

  return (
    <div className="mt-4 space-y-3">
      <Drawer open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Filter & sort</span>
              {activeChips.length ? (
                <span className="text-xs text-muted-foreground">
                  {activeChips.length} active
                </span>
              ) : null}
            </Button>
          </DrawerTrigger>
          {showClear ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>

        <div className="hidden sm:block">
          <FilterFields
            layout="inline"
            query={query}
            status={status}
            type={type}
            dateRange={dateRange}
            options={options}
            onQueryChange={onQueryChange}
            onStatusChange={onStatusChange}
            onTypeChange={onTypeChange}
            onDateRangeChange={onDateRangeChange}
            onClearDateRange={onClearDateRange}
            calendarMonths={calendarMonths}
            showClear={showClear}
            onReset={onReset}
            showTraining={showTraining}
            onToggleTraining={onToggleTraining}
          />
        </div>

        <DrawerContent className="bg-card text-card-foreground sm:hidden w-full max-w-lg mx-auto rounded-t-2xl border shadow-xl p-3 max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Filter & sort</DrawerTitle>
            <DrawerDescription className="text-xs">
              Narrow results without losing urgency context.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-3">
            <FilterFields
              layout="stacked"
              query={query}
              status={status}
              type={type}
              dateRange={dateRange}
              options={options}
              onQueryChange={onQueryChange}
              onStatusChange={onStatusChange}
              onTypeChange={onTypeChange}
              onDateRangeChange={onDateRangeChange}
              onClearDateRange={onClearDateRange}
              calendarMonths={calendarMonths}
              showClear={false}
              onReset={onReset}
              showTraining={showTraining}
              onToggleTraining={onToggleTraining}
            />
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
              >
                Clear all
              </Button>
              <DrawerClose asChild>
                <Button>Apply</Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeChips.map((chip) => (
            <Button
              key={chip.label}
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={chip.onClear}
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label} ✕
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={onReset}>
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FilterFields({
  layout,
  query,
  status,
  type,
  dateRange,
  options,
  onQueryChange,
  onStatusChange,
  onTypeChange,
  onDateRangeChange,
  onClearDateRange,
  calendarMonths,
  showClear,
  onReset,
  showTraining,
  onToggleTraining,
}: DispatchFiltersProps & {
  layout: "inline" | "stacked";
}) {
  const containerClass =
    layout === "inline"
      ? "flex w-full flex-wrap items-stretch gap-2"
      : "flex flex-col gap-3";

  return (
    <div className={containerClass}>
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search location, state, actions..."
        className={layout === "inline" ? "w-full sm:max-w-md" : "w-full"}
        aria-label="Search dispatches"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          className="w-full sm:w-[160px]"
          aria-label="Filter by status"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {options.statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_META[s as keyof typeof STATUS_META]?.label ?? humanize(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger
          className="w-full sm:w-[160px]"
          aria-label="Filter by type"
        >
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {options.types.map((t) => (
            <SelectItem key={t} value={t}>
              {DISPATCH_TYPE_LABELS[t as keyof typeof DISPATCH_TYPE_LABELS] ??
                humanize(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-[220px] justify-start text-left font-normal"
            aria-label="Filter by date range"
          >
            {formatDateRange(dateRange) ?? "Date range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-[80] max-w-[calc(100vw-2rem)]"
          align="start"
        >
          <div className="p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onDateRangeChange({ from: new Date(), to: undefined })
                }
              >
                From now →
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const start = startOfToday();
                  const end = endOfToday();
                  onDateRangeChange({ from: start, to: end });
                }}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const start = new Date();
                  const end = endOfRange(3);
                  onDateRangeChange({ from: start, to: end });
                }}
              >
                Next 3 days
              </Button>
              <Button size="sm" variant="ghost" onClick={onClearDateRange}>
                Clear
              </Button>
            </div>
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to } as any}
              onSelect={(range: any) =>
                onDateRangeChange({ from: range?.from, to: range?.to })
              }
              numberOfMonths={calendarMonths}
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Switch
          id={`training-toggle-${layout}`}
          checked={showTraining}
          onCheckedChange={onToggleTraining}
          className="peer"
        />
        <label
          htmlFor={`training-toggle-${layout}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show training dispatches
        </label>
      </div>
      {showClear ? (
        <Button variant="ghost" onClick={onReset}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function endOfRange(days: number) {
  const d = endOfToday();
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateRange(dateRange: DateRange) {
  if (!dateRange.from && !dateRange.to) return null;
  const from = dateRange.from?.toLocaleDateString();
  const to = dateRange.to?.toLocaleDateString();
  if (from && to) return `${from} – ${to}`;
  if (from) return `${from} →`;
  if (to) return `… – ${to}`;
  return null;
}

function buildActiveChips({
  query,
  status,
  type,
  dateRange,
  onQueryChange,
  onStatusChange,
  onTypeChange,
  onClearDateRange,
  showTraining,
  onToggleTraining,
}: {
  query: string;
  status: string;
  type: string;
  dateRange: DateRange;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClearDateRange: () => void;
  showTraining: boolean;
  onToggleTraining: (value: boolean) => void;
}) {
  const chips: { label: string; onClear: () => void }[] = [];
  if (query.trim().length > 0) {
    chips.push({
      label: `Search: "${query.trim()}"`,
      onClear: () => onQueryChange(""),
    });
  }
  if (status !== "all") {
    chips.push({
      label: `Status: ${
        STATUS_META[status as keyof typeof STATUS_META]?.label ??
        humanize(status)
      }`,
      onClear: () => onStatusChange("all"),
    });
  }
  if (type !== "all") {
    chips.push({
      label: `Type: ${
        DISPATCH_TYPE_LABELS[type as keyof typeof DISPATCH_TYPE_LABELS] ??
        humanize(type)
      }`,
      onClear: () => onTypeChange("all"),
    });
  }
  if (dateRange.from || dateRange.to) {
    chips.push({
      label: `Dates: ${formatDateRange(dateRange) ?? "Custom"}`,
      onClear: onClearDateRange,
    });
  }
  if (showTraining) {
    chips.push({
      label: "Training included",
      onClear: () => onToggleTraining(false),
    });
  }
  return chips;
}
