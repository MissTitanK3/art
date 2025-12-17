"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { DateTimePicker } from "@workspace/ui/patterns/common/date-time-picker";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type Props = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchDateOfEventUpdater({
  submission,
  onUpdate,
}: Props) {
  const persistedValue = submission.date_of_event ?? null;
  const [value, setValue] = useState<string | undefined>(
    persistedValue ?? undefined
  );
  const [recentlySaved, setRecentlySaved] = useState(false);

  useEffect(() => {
    setValue(persistedValue ?? undefined);
  }, [persistedValue]);

  useEffect(() => {
    if (!recentlySaved) return;

    const timer = setTimeout(() => setRecentlySaved(false), 2000);
    return () => clearTimeout(timer);
  }, [recentlySaved]);

  const isDirty = (value ?? null) !== persistedValue;
  const primaryLabel = isDirty
    ? "Update"
    : persistedValue
      ? "Updated"
      : "Set Date";

  const handleSave = () => {
    if (!isDirty) return;

    onUpdate({ date_of_event: value ?? null });
    setRecentlySaved(true);
  };

  const handleClear = () => {
    if (!isDirty) return;

    setValue(undefined);
    onUpdate({ date_of_event: null });
    setRecentlySaved(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Date of Event</CardTitle>
        <CardDescription>
          Use this to schedule or record the event time. Defaults to now for new
          dispatches; set a future time for Planned Events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateTimePicker
          layout="col"
          label="Date of Event"
          value={value}
          onChange={setValue}
        />
        <div className="flex gap-2 items-center justify-between">
          <div className="flex-1">
            {isDirty || recentlySaved ? (
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {isDirty ? "Unsaved changes" : "Updated"}
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            {value ? (
              <Button size="sm" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            ) : null}
            <Button size="sm" onClick={handleSave} disabled={!isDirty}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
