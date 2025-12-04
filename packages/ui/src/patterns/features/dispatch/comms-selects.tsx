import type {
  CommsImportance,
  CommsMessageType,
} from "@workspace/store/types/comms.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";

type BaseProps = {
  className?: string;
};

type TypeSelectProps = BaseProps & {
  value: CommsMessageType;
  onChange: (v: CommsMessageType) => void;
};

export function CommsTypeSelect({
  value,
  onChange,
  className,
}: TypeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as CommsMessageType)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Routine">Routine</SelectItem>
        <SelectItem value="Priority">Priority</SelectItem>
        <SelectItem value="Emergency">Emergency</SelectItem>
      </SelectContent>
    </Select>
  );
}

type ImportanceSelectProps = BaseProps & {
  value: CommsImportance;
  onChange: (v: CommsImportance) => void;
};

export function CommsImportanceSelect({
  value,
  onChange,
  className,
}: ImportanceSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CommsImportance)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Importance" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Low">Low</SelectItem>
        <SelectItem value="Normal">Normal</SelectItem>
        <SelectItem value="High">High</SelectItem>
      </SelectContent>
    </Select>
  );
}
