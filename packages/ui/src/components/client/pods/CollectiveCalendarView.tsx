"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn, formatDateRange } from "@workspace/ui/lib/utils";
import {
  addDays,
  addHours,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutList,
  Sparkles,
} from "lucide-react";
import { CollectiveCalendarShift, formatDay } from "./CollectiveCalendarShared";
import { CollectiveCalendarShiftCard } from "./CollectiveCalendarShiftCard";

type CollectiveCalendarViewProps = {
  viewMode: "week" | "day" | "month" | "mine";
  onViewModeChange: (mode: "week" | "day" | "month" | "mine") => void;
  loading: boolean;
  error: string | null;
  filteredShifts: CollectiveCalendarShift[];
  groupedByDay: { key: string; date: Date; shifts: CollectiveCalendarShift[] }[];
  selectedDay: Date;
  setSelectedDay: (date: Date) => void;
  selectedDayShifts: CollectiveCalendarShift[];
  busyDays: Set<string>;
  onSelectShift: (shift: CollectiveCalendarShift) => void;
  onAddShiftAt?: (start: Date) => void;
};

const DATE_KEY_FORMAT = "yyyy-MM-dd";

function toDateKey(value: Date | string) {
  return format(
    typeof value === "string" ? new Date(value) : value,
    DATE_KEY_FORMAT,
  );
}

type DaySummary = {
  general: string;
  pods: string;
};

function summarizeDayShifts(shifts: CollectiveCalendarShift[]): DaySummary {
  if (shifts.length === 0) {
    return {
      general: "No shifts scheduled.",
      pods: "No locations provided.",
    };
  }

  const sorted = [...shifts].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
  const earliest = sorted[0]!;
  const latest = sorted[sorted.length - 1]!;
  const tz = earliest.tz;
  const shiftCountLabel = shifts.length === 1 ? "1 shift" : `${shifts.length} shifts`;
  const firstStartFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    timeZone: tz,
  });
  const lastEndFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    timeZone: tz,
    timeZoneName: "short",
  });
  const firstStartLabel = firstStartFormatter.format(new Date(earliest.start));
  const lastEndLabel = lastEndFormatter.format(new Date(latest.end));

  const uniqueLocations = Array.from(
    new Set(
      sorted
        .map((shift) => shift.location?.trim())
        .filter((location): location is string => Boolean(location)),
    ),
  );
  const locationSummary =
    uniqueLocations.length === 0
      ? "Locations: Not specified."
      : uniqueLocations.length <= 2
        ? `Locations: ${uniqueLocations.join(", ")}`
        : `Locations: ${uniqueLocations.slice(0, 2).join(", ")} +${uniqueLocations.length - 2} more`;

  const uniqueLabels = Array.from(
    new Set(
      sorted
        .map((shift) => shift.label?.trim())
        .filter((label): label is string => Boolean(label)),
    ),
  );
  const focusSummary = uniqueLabels.length === 1 ? uniqueLabels[0] : null;

  const generalParts = [`First: ${firstStartLabel}`, `Last: ${lastEndLabel}`];
  if (focusSummary) {
    generalParts.push(`Focus: ${focusSummary}`);
  }

  return {
    general: generalParts.join(" • "),
    pods: locationSummary,
  };
}

export function CollectiveCalendarView({
  viewMode,
  onViewModeChange,
  loading,
  error,
  filteredShifts,
  groupedByDay,
  selectedDay,
  setSelectedDay,
  selectedDayShifts,
  busyDays,
  onSelectShift,
  onAddShiftAt,
}: CollectiveCalendarViewProps) {
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);

  const weekdayLabels = useMemo(() => {
    const reference = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) =>
      format(addDays(reference, index), "EEE"),
    );
  }, []);

  const dayShiftMap = useMemo(() => {
    const map = new Map<string, CollectiveCalendarShift[]>();
    filteredShifts.forEach((shift) => {
      const key = toDateKey(shift.start);
      const bucket = map.get(key) ?? [];
      bucket.push(shift);
      map.set(key, bucket);
    });
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    }
    return map;
  }, [filteredShifts]);

  const sortedSelectedDayShifts = useMemo(
    () =>
      [...selectedDayShifts].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      ),
    [selectedDayShifts],
  );

  useEffect(() => {
    if (viewMode !== "month" && monthSheetOpen) {
      setMonthSheetOpen(false);
    }
  }, [viewMode, monthSheetOpen]);

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    setMonthSheetOpen(true);
  };

  const dayTimeline = useMemo(() => {
    const dayStart = startOfDay(selectedDay);
    const hours = Array.from({ length: 24 }, (_, index) => {
      const hourStart = addHours(dayStart, index);
      const hourEnd = addHours(hourStart, 1);
      return {
        hourStart,
        hourEnd,
        entries: [] as Array<{ shift: CollectiveCalendarShift; isStart: boolean }>,
      };
    });

    sortedSelectedDayShifts.forEach((shift) => {
      const shiftStart = new Date(shift.start);
      const shiftEnd = new Date(shift.end);
      hours.forEach((block) => {
        if (shiftStart < block.hourEnd && shiftEnd > block.hourStart) {
          const isStart = shiftStart >= block.hourStart && shiftStart < block.hourEnd;
          block.entries.push({ shift, isStart });
        }
      });
    });

    return hours;
  }, [selectedDay, sortedSelectedDayShifts]);

  const renderWeekList = () => {
    if (groupedByDay.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No shifts in this window. Try widening filters.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {groupedByDay.map(({ key, date, shifts }) => (
          <div key={key} className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">{formatDay(date)}</p>
              <p className="text-xs text-muted-foreground">
                {shifts.length} shift{shifts.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="space-y-2">
              {shifts.map((shift) => (
                <CollectiveCalendarShiftCard
                  key={shift.id}
                  shift={shift}
                  onClick={onSelectShift}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayTimeline = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{formatDay(selectedDay)}</p>
            <p className="text-xs text-muted-foreground">
              + Add shift will fill in that hour automatically.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 text-xs sm:w-auto sm:justify-end">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setSelectedDay(addDays(selectedDay, -1))}
            >
              ◀
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setSelectedDay(addDays(selectedDay, 1))}
            >
              ▶
            </Button>
          </div>
        </div>
        {selectedDayShifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shifts on this day yet — add one below.
          </p>
        ) : null}
        <div className="rounded-md border">
          {dayTimeline.map(({ hourStart, entries }) => (
            <div
              key={hourStart.toISOString()}
              className="flex flex-col gap-3 border-b px-3 py-3 last:border-b-0 md:flex-row"
            >
              <div className="flex items-center justify-between gap-2 md:w-32 md:flex-col md:items-start">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {format(hourStart, "h a")}
                </p>
                {onAddShiftAt && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAddShiftAt(hourStart)}
                  >
                    + Add shift
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                {entries.length === 0 ? (
                  <div className="flex h-10 items-center justify-between rounded border border-dashed border-muted/50 px-3 text-xs text-muted-foreground">
                    <span>No coverage registered</span>
                    {!onAddShiftAt && <span>—</span>}
                  </div>
                ) : (
                  entries.map(({ shift, isStart }) =>
                    isStart ? (
                      <CollectiveCalendarShiftCard
                        key={`${shift.id}-${hourStart.toISOString()}`}
                        shift={shift}
                        onClick={onSelectShift}
                      />
                    ) : (
                      <div
                        key={`${shift.id}-${hourStart.toISOString()}-cont`}
                        className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs"
                      >
                        <p className="font-semibold leading-tight">
                          {shift.label ?? shift.pod.name}
                        </p>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Continues through this hour
                        </p>
                        <p
                          className="text-[0.65rem] text-muted-foreground"
                          suppressHydrationWarning
                        >
                          {formatDateRange(shift.start, shift.end, shift.tz)}
                        </p>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthOverview = () => {
    const monthStart = startOfMonth(selectedDay);
    const monthEnd = endOfMonth(selectedDay);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const selectedDayCount = selectedDayShifts.length;

    return (
      <>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold">
                {format(monthStart, "MMMM yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                Tap any day to review its shifts in the sheet.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Previous month"
                onClick={() => setSelectedDay(addMonths(selectedDay, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Next month"
                onClick={() => setSelectedDay(addMonths(selectedDay, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-md border p-3">
            <div className="grid grid-cols-7 gap-2 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {weekdayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const key = toDateKey(day);
                const shifts = dayShiftMap.get(key) ?? [];
                const shiftCount = shifts.length;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDay);
                const today = isToday(day);
                const isBusy = busyDays.has(key) || shiftCount > 0;
                const shiftLabel = `${shiftCount} shift${shiftCount === 1 ? "" : "s"}`;
                const summary = summarizeDayShifts(shifts);
                const showCountOnly = shiftCount === 0 ? null : String(shiftCount);
                const countLength = showCountOnly ? Math.min(showCountOnly.length, 3) : 1;
                const countSizeClass =
                  countLength === 1
                    ? "text-base"
                    : countLength === 2
                      ? "text-sm"
                      : "text-xs";

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleDaySelect(day)}
                    className={cn(
                      "group flex min-h-[60px] flex-col rounded-md border bg-card p-1 text-left text-xs shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring md:min-h-[110px]",
                      !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                      isSelected && "border-primary ring-2 ring-primary",
                      today && "border-primary/70 bg-[#66339910]",
                    )}
                  >
                    <div className="text-[0.75rem] font-semibold">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn("hidden md:inline", today ?? "text-[#663399]")}>{format(day, "d")}</span>
                        <div className="md:hidden flex w-full flex-col items-start text-sm font-semibold">
                          <span>{format(day, "d")}</span>
                        </div>
                      </div>
                      <hr className="my-1 border-border" />
                      <span
                        className={cn(
                          "md:hidden font-semibold text-primary leading-none",
                          countSizeClass,
                        )}
                      >
                        {showCountOnly ?? "0"}
                      </span>
                    </div>
                    <div className="mt-2 hidden text-[0.7rem] leading-snug text-muted-foreground md:block">
                      <p className="hidden lg:block">{summary.general}</p>
                      <p className="md:block lg:hidden">{summary.pods}</p>
                    </div>
                    <div className="mt-auto hidden items-center justify-between gap-2 md:flex">
                      <span
                        className={cn(
                          "block h-1 w-full rounded-full",
                          today ? "bg-[#663399]" : "bg-muted",
                        )}
                      />
                      {shiftCount > 0 ? (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                          {shiftLabel}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Sheet
          open={viewMode === "month" && monthSheetOpen}
          onOpenChange={setMonthSheetOpen}
        >
          <SheetContent
            side="right"
            className="flex h-full flex-col gap-4 overflow-y-auto p-4 bg-card text-card-foreground z-[1100]"
          >
            <SheetHeader>
              <SheetTitle>{formatDay(selectedDay)}</SheetTitle>
              <SheetDescription>
                {selectedDayCount === 0
                  ? "No shifts planned for this day."
                  : `${selectedDayCount} shift${selectedDayCount === 1 ? "" : "s"} planned.`}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3">
              {sortedSelectedDayShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing scheduled — timeline shows open hours.
                </p>
              ) : null}
              <div className="rounded-md border">
                {dayTimeline.map(({ hourStart, entries }) => (
                  <div
                    key={hourStart.toISOString()}
                    className="flex gap-3 border-b px-3 py-2 last:border-b-0"
                  >
                    <div className="flex flex-col items-center justify-between gap-2 md:w-32 md:flex-row md:items-start">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {format(hourStart, "h a")}
                      </p>
                      {onAddShiftAt && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => onAddShiftAt(hourStart)}
                        >
                          + Add shift
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      {entries.length === 0 ? (
                        <div className="h-10 rounded border border-dashed border-muted/40 bg-muted/5" />
                      ) : (
                        entries.map(({ shift, isStart }) =>
                          isStart ? (
                            <CollectiveCalendarShiftCard
                              key={`${shift.id}-${hourStart.toISOString()}`}
                              shift={shift}
                              onClick={onSelectShift}
                            />
                          ) : (
                            <div
                              key={`${shift.id}-${hourStart.toISOString()}-cont`}
                              className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs"
                            >
                              <p className="font-semibold leading-tight">
                                {shift.label ?? shift.pod.name}
                              </p>
                              <p className="text-[0.65rem] text-muted-foreground">
                                Continues through this hour
                              </p>
                              <p
                                className="text-[0.65rem] text-muted-foreground"
                                suppressHydrationWarning
                              >
                                {formatDateRange(shift.start, shift.end, shift.tz)}
                              </p>
                            </div>
                          ),
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  };

  return (
    <Card>
      <div className="border-b px-3 md:pb-2">
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as any)}
          className="w-full mb-2"
        >
          <TabsList className="flex w-full h-full flex-col gap-2 sm:grid sm:grid-cols-4">
            <TabsTrigger
              value="week"
              className="justify-start w-full sm:justify-center font-semibold border border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <LayoutList className="mr-2 h-4 w-4" />
              Weekly List
            </TabsTrigger>
            <TabsTrigger
              value="day"
              className="justify-start w-full sm:justify-center font-semibold border border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Clock3 className="mr-2 h-4 w-4" />
              Day Timeline
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="justify-start w-full sm:justify-center font-semibold border border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Month Overview
            </TabsTrigger>
            <TabsTrigger
              value="mine"
              className="justify-start w-full sm:justify-center font-semibold border border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              My Shifts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading calendar…
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : viewMode === "month" ? (
          renderMonthOverview()
        ) : viewMode === "day" ? (
          renderDayTimeline()
        ) : filteredShifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shifts match these filters.
          </p>
        ) : (
          <>
            {viewMode === "week" && renderWeekList()}
            {viewMode === "mine" && renderWeekList()}
          </>
        )}
      </div>
    </Card>
  );
}
