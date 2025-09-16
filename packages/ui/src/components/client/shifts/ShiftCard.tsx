"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

import {
  DispatchShift,
  useDispatchRosterStore,
} from "@workspace/store/dispatchRosterStore";
import { usePodsStore } from "@workspace/store/podStore";
import EditShiftDrawer from "./EditShiftDrawer.tsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.tsx";

export default function ShiftCard({ shift }: { shift: DispatchShift }) {
  const isShiftActive = useDispatchRosterStore((s) => s.isShiftActive);
  const removeShift = useDispatchRosterStore((s) => s.removeShift);
  const roster = usePodsStore((s) => s.activeRoster);

  const pods = usePodsStore((s) => s.pods);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const pod = pods.find((p) => p.id === shift.podId);
  const volunteer = roster.find((v) => v.id === shift.volunteerId);

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
    removeShift(shift.id);
    toast.success("Shift deleted ✅");
  };
  console.log({ volunteer });


  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 w-full">
            <div className="flex items-center w-full justify-between flex-col sm:flex-row">
              <div className="flex items-center gap-2">
                {/* Volunteer display name */}
                {volunteer?.volunteer?.display_name ?? volunteer?.volunteer.display_name ?? "Unknown Volunteer"}
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
        <CardContent className="text-sm">
          <p>Pod: {pod?.name ?? shift.podId ?? "—"}</p>
          <p>
            ⏱ {new Date(shift.startsAt).toLocaleString()} →{" "}
            {new Date(shift.endsAt).toLocaleString()}
          </p>
          {shift.notes && <p className="mt-1">📝 {shift.notes}</p>}
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      <EditShiftDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        shift={shift}
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
