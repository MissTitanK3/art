import { Button } from "../button";
import { cn } from "@workspace/ui/lib/utils";

export type RegionViewMode = "info" | "dashboard";

type RegionViewToggleProps = {
  current: RegionViewMode;
  onChange: (mode: RegionViewMode) => void;
};

export function RegionViewToggle({ current, onChange }: RegionViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-muted p-1">
      <ToggleButton
        label="Template overview"
        active={current === "info"}
        onClick={() => onChange("info")}
      />
      <ToggleButton
        label="Demo dashboard"
        active={current === "dashboard"}
        onClick={() => onChange("dashboard")}
      />
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "ghost"}
      className={cn("rounded-full px-4", active ? "shadow-sm" : "")}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
