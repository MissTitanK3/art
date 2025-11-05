"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

type Props = {
  value?: Date;
  onChange: (date: Date) => void;
};

export function TimePickerSelect({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : new Date();

  const h24 = date.getHours();
  const selectedHour = h24 % 12 || 12;
  const selectedMinute = date.getMinutes();
  const selectedPeriod = h24 < 12 ? "AM" : "PM";

  const [hour, setHour] = React.useState(selectedHour.toString());
  const [minute, setMinute] = React.useState(selectedMinute.toString().padStart(2, "0"));
  const [period, setPeriod] = React.useState(selectedPeriod);

  React.useEffect(() => {
    if (open) {
      const d = value ? new Date(value) : new Date();
      const h24 = d.getHours();
      setHour((h24 % 12 || 12).toString());
      setMinute(d.getMinutes().toString().padStart(2, "0"));
      setPeriod(h24 < 12 ? "AM" : "PM");
    }
  }, [open, value]);

  const label = value
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "Pick a time";

  const handleConfirm = () => {
    const updated = new Date(date);
    let h24 = (parseInt(hour, 10) % 12);
    if (period === "PM") h24 += 12;
    updated.setHours(h24, parseInt(minute, 10), 0, 0);
    onChange(updated);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-[160px]",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-auto space-y-3 z-[80]" align="start">
        <div className="flex gap-2">
          {/* Hours */}
          <Select value={hour} onValueChange={setHour}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Minutes */}
          <Select value={minute} onValueChange={setMinute}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")).map(
                (m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          {/* AM/PM */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
