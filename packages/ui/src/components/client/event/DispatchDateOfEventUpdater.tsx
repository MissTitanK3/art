"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type Props = {
  submission: DispatchSubmission;
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
};

export default function DispatchDateOfEventUpdater({
  submission,
  onUpdate,
}: Props) {
  const [value, setValue] = useState<string | undefined>(
    submission.date_of_event ?? undefined,
  );

  useEffect(() => {
    setValue(submission.date_of_event ?? undefined);
  }, [submission.date_of_event]);

  const handleSave = () => {
    if (!value) {
      onUpdate({ date_of_event: null });
      return;
    }
    onUpdate({ date_of_event: value });
  };

  const handleClear = () => {
    setValue(undefined);
    onUpdate({ date_of_event: null });
  };

  return (
    <div className="space-y-2 items-center h-full w-full">
      {/* <p className="font-medium">Event Date/Time</p> */}
      <div className="flex h-full flex-col gap-2 md:flex-row md:items-end md:gap-3 w-full">
        <DateTimePicker
          label="Date of Event"
          value={value}
          onChange={setValue}
        />
        <div className="flex gap-2 w-full md:w-auto mt-auto md:mt-0 justify-end md:self-end">
          {value ? (
            <Button size="sm" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          ) : null}
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Use this to schedule or record the event time. Defaults to now for new
        dispatches; set a future time for Planned Events.
      </p>
    </div>
  );
}
