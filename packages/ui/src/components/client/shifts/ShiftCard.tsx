"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

import type { DispatchShift } from "@workspace/store/useDispatchStore";
import type { Pod, RosterEntry } from "@workspace/store/types/pod.ts";
import EditShiftDrawer from "./EditShiftDrawer.tsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.tsx";

type ShiftCardProps = {
  shift: DispatchShift;
  pods: Pod[];
  roster: RosterEntry[];
  onRemoveShift: (shiftId: string) => void;
  onUpdateShift: (id: string, updates: Partial<DispatchShift>) => void;
  isShiftActive: (shift: DispatchShift) => boolean;
};

export default function ShiftCard({
  shift,
  pods,
  roster,
  onRemoveShift,
  onUpdateShift,
  isShiftActive,
}: ShiftCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const pod = pods.find((p) => p.id === shift.podId);
  // Resolve volunteer by either roster entry id (local shifts) or profile id (DB-fetched shifts)
  const volunteer =
    roster.find((v) => v.id === shift.volunteerId) ||
    roster.find((v) => v.profile?.id === shift.volunteerId);
  // Prefer roster match by profile id or hydrated volunteerName from DB; do not show raw ids
  const volunteerDisplayName =
    volunteer?.profile?.display_name ??
    shift.volunteerName ??
    "Unknown Volunteer";

  const statusBadge = useMemo(() => {
    const now = new Date();
    const start = new Date(shift.startsAt);
    const end = new Date(shift.endsAt);

    if (isShiftActive(shift)) {
      return <Badge variant="default">Active</Badge>;
    }

    if (start > now) {
      const diffMs = start.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 1) {
        return <Badge variant="secondary">Starts in 1h</Badge>;
      }
      return <Badge variant="outline">Upcoming</Badge>;
    }

    if (end < now) {
      return <Badge variant="destructive">Ended</Badge>;
    }

    return null;
  }, [shift, isShiftActive]);

  const handleDelete = () => {
    onRemoveShift(shift.id);
    toast.success("Shift deleted ✅");
  };


  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 w-full">
            <div className="flex items-center w-full justify-between flex-col sm:flex-row">
              <div className="flex items-center gap-2 flex-col sm:flex-row">
                {/* Volunteer display name */}
                <p>(Pod: {pod?.name ?? shift.podId ?? "—"})</p>
                <hr className="my-1 w-full h-2 bg-muted md:hidden" />
                <hr className="my-1 w-7 h-2 rotate-90 bg-muted hidden md:block" />
                <span>{volunteerDisplayName}</span>
                {statusBadge}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit shift"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete shift"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash size={16} className="text-destructive" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm flex justify-evenly">
          <p>
            ⏱ {new Date(shift.startsAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })} →{" "}
            {new Date(shift.endsAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
          </p>
          {shift.notes && <p className="mt-1">📝 {shift.notes}</p>}
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      <EditShiftDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        shift={shift}
        pods={pods}
        roster={roster}
        onUpdateShift={onUpdateShift}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Shift"
        description="Are you sure you want to delete this shift? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}
