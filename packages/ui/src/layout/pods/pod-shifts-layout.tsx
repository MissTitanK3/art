import { Separator } from "@workspace/ui/primitives/separator";
import { Card } from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Trash2 } from "lucide-react";
import { Shift } from "@workspace/store/types/pod.ts";
import { formatDateRange } from "@workspace/ui/lib/utils";
import { ShiftIntentionSection } from "@workspace/ui/patterns/features/shifts/shift-intention-section";
import type { BaseShiftIntentionFields } from "@workspace/store/types/pod.ts";
export type PodShiftsLayoutForm<T extends BaseShiftIntentionFields> = T;
export type PodShiftsLayoutProps<TForm extends BaseShiftIntentionFields> = {
  podSlug: string;
  podId?: string;
  description?: React.ReactNode;
  form: TForm;
  setForm: React.Dispatch<React.SetStateAction<TForm>>;
  onAddShift: () => void;
  shifts: Shift[];
  onRemoveShift: (shiftId: string) => void;
  addShiftButtonText?: string;
  loadingMessage?: React.ReactNode;
  notFoundMessage?: React.ReactNode;
  emptyState?: React.ReactNode;
};
export function PodShiftsLayout<TForm extends BaseShiftIntentionFields>({
  podSlug,
  podId,
  description = (
    <p className="mt-1 text-sm text-muted-foreground">
      Configure shifts and availability for this pod.
    </p>
  ),
  form,
  setForm,
  onAddShift,
  shifts,
  onRemoveShift,
  addShiftButtonText = "Add Shift",
  loadingMessage,
  notFoundMessage,
  emptyState,
}: PodShiftsLayoutProps<TForm>) {
  if (!podId && notFoundMessage) {
    return (
      <section className="mx-auto w-full max-w-4xl">{notFoundMessage}</section>
    );
  }
  const hasShifts = shifts.length > 0;
  const shiftsList = hasShifts ? (
    <div className="grid gap-2">
      {shifts.map((shift) => (
        <Card key={shift.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{shift.label || "Untitled shift"}</p>
              <p
                className="text-xs text-muted-foreground"
                suppressHydrationWarning
              >
                {formatDateRange(shift.start, shift.end, shift.tz)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveShift(shift.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  ) : (
    (emptyState ?? (
      <p className="text-sm text-muted-foreground">No shifts added yet.</p>
    ))
  );
  return (
    <section className="mx-auto w-full max-w-4xl sm:px-4">
      {description}

      <ShiftIntentionSection
        title="Add Shift"
        form={form}
        setForm={setForm}
        onAdd={onAddShift}
        addButtonText={addShiftButtonText}
      />

      <Separator className="my-6" />

      {loadingMessage ? (
        <p className="mb-4 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}

      {shiftsList}
    </section>
  );
}
export default PodShiftsLayout;
