'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@workspace/ui/components/sheet";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

import { useState } from "react";
import { EditShiftForm } from "./EditShiftForm.tsx";
import { Shift } from "./shifts.ts";
import { Separator } from "../../separator.tsx";

function fmtRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  // keep it compact; tweak to taste
  return `${s.toLocaleString()} → ${e.toLocaleString()}`;
}

export default function PodShiftsList({
  podShifts,
  updateShift,
  removeShift,
}: {
  podShifts: Shift[];
  updateShift: (id: string, data: Partial<Shift>) => void;
  removeShift: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = podShifts.find((s) => s.id === editingId) ?? null;
  const now = Date.now();

  const filtered = podShifts.filter((s) => new Date(s.end).getTime() >= now)

  return (
    <>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No shifts yet.</p>
      )}

      <div className="grid gap-3">
        {filtered
          .sort((a, b) => {
            const aStart = new Date(a.start).getTime();
            const bStart = new Date(b.start).getTime();
            const aEnd = new Date(a.end).getTime();
            const bEnd = new Date(b.end).getTime();

            const aActive = aStart <= now && now <= aEnd;
            const bActive = bStart <= now && now <= bEnd;

            // Active shifts come first
            if (aActive && !bActive) return -1;
            if (bActive && !aActive) return 1;

            // Then sort by soonest start
            return aStart - bStart;
          })
          .map((s) => (
            <Card key={s.id} className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {s.label || "Unnamed shift"}
                </CardTitle>
              </CardHeader>
              <Separator />

              <CardContent className="text-sm">
                <div className="text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>📍 {s.location || "—"}</span>
                    <span>•</span>
                    <span>👥 {s.headcount} needed</span>
                  </div>
                  <CardDescription className="text-xs my-2">
                    {fmtRange(s.start, s.end)}
                  </CardDescription>
                  {s.dispatchLink && (
                    <div className="mt-2">
                      <a
                        href={s.dispatchLink}
                        className="inline-flex items-center underline underline-offset-4 hover:opacity-90"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Dispatch
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex w-full justify-between">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeShift(s.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-6" />
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(s.id)}
                  >
                    <Pencil className="mr-2 h-4 w-6" />
                    Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>

      {/* Single controlled Sheet for editing */}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditingId(null)}>
        <SheetContent side="right" className="w-full sm:w-[520px] max-w-none p-0 flex flex-col">
          <div className="border-b px-4 py-3">
            <SheetHeader>
              <SheetTitle>Edit Shift</SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {editing && (
              <EditShiftForm
                key={editing.id}
                initial={editing}
                onSave={(vals) => {
                  updateShift(editing.id, vals);
                  setEditingId(null);
                }}
              />
            )}
          </div>

          <div className="border-t px-4 py-3 flex items-center justify-end gap-2">
            <Button type="submit" form="edit-shift-form" className="min-w-24">
              Save
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
