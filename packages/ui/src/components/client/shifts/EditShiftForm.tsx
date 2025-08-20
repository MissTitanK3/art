// EditShiftForm.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Shift, ShiftFormInput, ShiftFormOutput, shiftSchema } from "./shifts.ts";


function toLocalInputValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 16);
}

export function EditShiftForm({
  initial,
  onSave,
}: {
  initial: Shift;
  onSave: (v: ShiftFormOutput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShiftFormInput, any, ShiftFormOutput>({
    resolver: zodResolver(shiftSchema),
    mode: "onChange",
    // defaultValues must match INPUT type (tz/dispatchLink can be undefined)
    defaultValues: {
      id: initial.id,
      podId: initial.podId,
      tz: initial.tz, // OK if undefined; schema .default() fills on output
      label: initial.label ?? "",
      start: toLocalInputValue(initial.start),
      end: toLocalInputValue(initial.end),
      location: initial.location ?? "",
      headcount: initial.headcount ?? undefined,
      dispatchLink: initial.dispatchLink ?? undefined, // not ""
    },
  });

  // Handler must accept OUTPUT type (post-transform/default)
  const submit: SubmitHandler<ShiftFormOutput> = (vals) => {
    onSave({
      ...initial,
      ...vals,
      start: new Date(vals.start).toISOString(),
      end: new Date(vals.end).toISOString(),
    });
  };

  return (
    <form id="edit-shift-form" onSubmit={handleSubmit(submit)} className="grid gap-3">
      <div className="grid gap-1">
        <Label htmlFor="e-label">Label</Label>
        <Input id="e-label" {...register("label")} />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="e-start">Start</Label>
        <Input id="e-start" type="datetime-local" {...register("start")} />
        {errors.start && <p className="text-xs text-destructive">{errors.start.message}</p>}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="e-end">End</Label>
        <Input id="e-end" type="datetime-local" {...register("end")} />
        {errors.end && <p className="text-xs text-destructive">{errors.end.message}</p>}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="e-location">Location</Label>
        <Input id="e-location" {...register("location")} />
        {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="e-headcount">How many needed</Label>
        <Input
          id="e-headcount"
          type="number"
          inputMode="numeric"
          // allow empty while typing → undefined → schema will error until filled
          {...register("headcount", {
            setValueAs: (v) => (v === "" ? undefined : Number(v)),
          })}
        />
        {errors.headcount && <p className="text-xs text-destructive">{errors.headcount.message}</p>}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="e-dlink">Dispatch link (optional)</Label>
        <Input
          id="e-dlink"
          placeholder="/dispatch/…"
          {...register("dispatchLink", {
            setValueAs: (v: string) => (v?.trim() === "" ? undefined : v.trim()),
          })}
        />
        {errors.dispatchLink && (
          <p className="text-xs text-destructive">{errors.dispatchLink.message}</p>
        )}
      </div>
    </form>
  );
}
