"use client";
import { cn } from "@workspace/ui/lib/utils";
import { DatePicker } from "./date-picker";
import { TimePickerSelect } from "./time-picker-select";
type Props = {
  label: string;
  value?: string; // ISO string
  onChange: (value: string) => void;
  layout?: "row" | "col"; // "row" (default) or "col" for vertical layout
  className?: string;
  fullWidth?: boolean;
};
export function DateTimePicker({
  label,
  value,
  onChange,
  layout = "row",
  className,
  fullWidth = false,
}: Props) {
  const date = value ? new Date(value) : undefined;
  const handleDateChange = (nextDate: string) => {
    const selected = new Date(nextDate);
    const current = date ?? new Date();
    selected.setHours(current.getHours(), current.getMinutes(), current.getSeconds(), current.getMilliseconds());
    onChange(selected.toISOString());
  };
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className={cn("flex gap-2", layout === "col" ? "flex-col" : "flex-col sm:flex-row")}>
        <DatePicker
          label={label}
          value={value}
          onChange={handleDateChange}
          fullWidth={fullWidth}
          hideLabel
        />
        <div className="flex items-center gap-2">
          <TimePickerSelect
            value={date}
            onChange={(newDate) => onChange(newDate.toISOString())}
            fullWidth={fullWidth}
          />
        </div>
      </div>
    </div>
  );
}
