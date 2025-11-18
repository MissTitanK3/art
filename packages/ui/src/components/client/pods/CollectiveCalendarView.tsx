"use client";

import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Card } from "@workspace/ui/components/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { addDays } from "date-fns";
import {
  CalendarDays,
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
};

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
}: CollectiveCalendarViewProps) {

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
            <div className="flex items-center justify-between">
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{formatDay(selectedDay)}</p>
            <p className="text-xs text-muted-foreground">
              Scroll horizontally to explore different days.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
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
            No shifts on this day.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDayShifts.map((shift) => (
              <div key={shift.id} className="relative pl-4">
                <div className="absolute left-0 top-2 h-full w-px bg-border" />
                <div className="absolute left-[-6px] top-2 h-3 w-3 rounded-full bg-primary" />
                <CollectiveCalendarShiftCard
                  shift={shift}
                  onClick={onSelectShift}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMonthOverview = () => {
    return (
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={(date) => date && setSelectedDay(date)}
          modifiers={{
            active: Array.from(busyDays).map((d) => new Date(d)),
          }}
          modifiersClassNames={{
            active:
              "after:absolute after:bottom-1 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary",
          }}
          className="rounded-md border"
        />
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              {formatDay(selectedDay)} — {selectedDayShifts.length} shift
              {selectedDayShifts.length === 1 ? "" : "s"}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewModeChange("day")}
            >
              Open timeline
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {selectedDayShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tap a date with dots to see planned shifts.
              </p>
            ) : (
              selectedDayShifts.map((shift) => (
                <div key={shift.id}>
                  <CollectiveCalendarShiftCard
                    shift={shift}
                    onClick={onSelectShift}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="border-b px-3 py-2">
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">
              <LayoutList className="mr-2 h-4 w-4" />
              Weekly list
            </TabsTrigger>
            <TabsTrigger value="day">
              <Clock3 className="mr-2 h-4 w-4" />
              Day timeline
            </TabsTrigger>
            <TabsTrigger value="month">
              <CalendarDays className="mr-2 h-4 w-4" />
              Month dots
            </TabsTrigger>
            <TabsTrigger value="mine">
              <Sparkles className="mr-2 h-4 w-4" />
              My shifts
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
        ) : filteredShifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shifts match these filters.
          </p>
        ) : (
          <>
            {viewMode === "week" && renderWeekList()}
            {viewMode === "day" && renderDayTimeline()}
            {viewMode === "month" && renderMonthOverview()}
            {viewMode === "mine" && renderWeekList()}
          </>
        )}
      </div>
    </Card>
  );
}
