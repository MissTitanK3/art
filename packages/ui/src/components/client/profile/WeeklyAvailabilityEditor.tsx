"use client";
import * as React from "react";
import { Input } from "../../input.tsx";
import { Button } from "../../button.tsx";
import { Separator } from "../../separator.tsx";
import { format, parse } from "date-fns";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function format24hr(time: string) {
  try {
    return format(parse(time, "HH:mm", new Date()), "HH:mm")
  } catch {
    return ""
  }
}


export function WeeklyAvailabilityEditor({
  value,
  onChange,
}: {
  value: { blocks?: Record<string, { start: string; end: string }[]> };
  onChange: (next: { blocks: Record<string, { start: string; end: string }[]> }) => void;
}) {
  const blocks = value?.blocks ?? {};
  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const dayBlocks = blocks[day] ?? []
        return (
          <div key={day} className="rounded-xl border p-3">
            <div className="font-medium mb-2">{day}</div>
            <div className="space-y-2">
              {dayBlocks.map((b, i) => (
                <div key={i} className="flex w-full flex-col gap-2">
                  {/* Time inputs */}
                  <div className="flex flex-col justify-center flex-wrap items-center gap-2">
                    <div className="flex flex-col items-center">
                      <Input
                        type="time"
                        value={b.start}
                        step={900} // 15 minutes
                        onChange={(e) => {
                          const next = [...dayBlocks]
                          next[i] = { ...b, start: e.target.value }
                          onChange({ blocks: { ...blocks, [day]: next } })
                        }}
                        className="w-fit"
                        inputMode="numeric"
                        pattern="[0-2][0-9]:[0-5][0-9]"
                      />
                      <span className="text-xs text-muted-foreground ml-1">
                        {format24hr(b.start)} (24hr)
                      </span>
                    </div>

                    <span className="text-sm">to</span>

                    <div className="flex flex-col items-center">
                      <Input
                        type="time"
                        value={b.end}
                        step={900} // 15 minutes
                        onChange={(e) => {
                          const next = [...dayBlocks]
                          next[i] = { ...b, end: e.target.value }
                          onChange({ blocks: { ...blocks, [day]: next } })
                        }}
                        className="w-fit"
                        inputMode="numeric"
                        pattern="[0-2][0-9]:[0-5][0-9]"
                      />
                      <span className="text-xs text-muted-foreground ml-1">
                        {format24hr(b.end)} (24hr)
                      </span>
                    </div>

                  </div>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => {
                      const next = dayBlocks.filter((_, idx) => idx !== i)
                      onChange({ blocks: { ...blocks, [day]: next } })
                    }}
                  >
                    Remove
                  </Button>

                  <Separator />
                </div>

              ))}
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  const next = [...dayBlocks, { start: "09:00", end: "13:00" }]
                  onChange({ blocks: { ...blocks, [day]: next } })
                }}
              >
                Add block
              </Button>
            </div>
          </div>
        )
      })}
    </div>

  );
}
