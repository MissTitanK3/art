"use client";

"use client";

import * as React from "react";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { canManageInstructorsFromRoles } from "@workspace/ui/lib/permissions";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import InstructorForm, { type InstructorFormHandle } from "@workspace/ui/components/academy/pod/InstructorForm";
import type {
  AcademyInstructorDraft,
  AcademyInstructorProfile,
  AcademyInstructorVettingStatus,
} from "@workspace/store/types/academy";

import InstructorCard from "@workspace/ui/components/academy/pod/InstructorCard";

type InstructorBenchProps = {
  instructors: AcademyInstructorProfile[];
  onCreateInstructor?: (instructor: AcademyInstructorDraft) => void;
  onUpdateInstructor?: (
    instructorId: string,
    patch: Partial<AcademyInstructorProfile>,
  ) => void;
  onRemoveInstructor?: (instructorId: string) => void;
  learnerCount: number;
  canManageInstructors?: boolean;
  currentUserRole?: string;
  currentUserRoles?: string[];
};


export function InstructorBench({
  instructors,
  onCreateInstructor,
  onUpdateInstructor,
  onRemoveInstructor,
  learnerCount,
  canManageInstructors = false,
  currentUserRole,
  currentUserRoles,
}: InstructorBenchProps) {
  const handleCreateInstructor = onCreateInstructor ?? (() => { });
  const handleUpdateInstructor = onUpdateInstructor ?? (() => { });
  const handleRemoveInstructor = onRemoveInstructor ?? (() => { });

  React.useEffect(() => {
    // If the parent did not pass real handlers, warn so devs know no network calls will happen
    if (!onCreateInstructor) console.warn("InstructorBench: onCreateInstructor prop not provided — create will be a no-op.");
    if (!onUpdateInstructor) console.warn("InstructorBench: onUpdateInstructor prop not provided — update will be a no-op.");
    if (!onRemoveInstructor) console.warn("InstructorBench: onRemoveInstructor prop not provided — remove will be a no-op.");
  }, [onCreateInstructor, onUpdateInstructor, onRemoveInstructor]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isManageSheetOpen, setIsManageSheetOpen] = React.useState(false);
  const totalInstructors = instructors.length;
  const profileRoles = useProfileStore((s) => (s.profile?.access_role ? [String(s.profile.access_role)] : []));

  const effectiveCanManageInstructors = React.useMemo(() => {
    if (canManageInstructors) return true;
    const roles = profileRoles && profileRoles.length > 0
      ? profileRoles
      : currentUserRoles ?? (currentUserRole ? [currentUserRole] : []);
    return canManageInstructorsFromRoles(roles);
  }, [canManageInstructors, currentUserRole, currentUserRoles, profileRoles]);

  const {
    registeredInstructorCount,
    guestInstructorCount,
    clearedInstructorCount,
    needsReviewInstructorCount,
    awaitingInstructorCount,
  } = React.useMemo(() => {
    let registered = 0;
    let guests = 0;
    let cleared = 0;
    let needsReview = 0;
    let awaiting = 0;
    for (const instructor of instructors) {
      if (instructor.registrationStatus === "unregistered") {
        guests += 1;
      } else {
        registered += 1;
      }
      const vettingStatus: AcademyInstructorVettingStatus =
        instructor.vettingStatus ?? "awaiting_verification";
      if (vettingStatus === "cleared") {
        cleared += 1;
      } else if (vettingStatus === "needs_review") {
        needsReview += 1;
      } else {
        awaiting += 1;
      }
    }
    return {
      registeredInstructorCount: registered,
      guestInstructorCount: guests,
      clearedInstructorCount: cleared,
      needsReviewInstructorCount: needsReview,
      awaitingInstructorCount: awaiting,
    };
  }, [instructors]);

  const instructorSummaryLabel = React.useMemo(() => {
    if (totalInstructors === 0) return "No instructors added yet";
    const parts: string[] = [];
    parts.push(
      `${totalInstructors} ${totalInstructors === 1 ? "instructor" : "instructors"}`,
    );
    const detailSegments: string[] = [];
    if (registeredInstructorCount > 0) {
      detailSegments.push(`${registeredInstructorCount} registered`);
    }
    if (guestInstructorCount > 0) {
      detailSegments.push(
        `${guestInstructorCount} guest SME${guestInstructorCount === 1 ? "" : "s"}`,
      );
    }
    if (clearedInstructorCount > 0) {
      detailSegments.push(`${clearedInstructorCount} cleared`);
    }
    if (needsReviewInstructorCount > 0) {
      detailSegments.push(`${needsReviewInstructorCount} needs review`);
    }
    if (awaitingInstructorCount > 0) {
      detailSegments.push(`${awaitingInstructorCount} awaiting verification`);
    }
    if (detailSegments.length > 0) {
      parts.push(`(${detailSegments.join(" · ")})`);
    }
    return parts.join(" ");
  }, [
    awaitingInstructorCount,
    clearedInstructorCount,
    guestInstructorCount,
    needsReviewInstructorCount,
    registeredInstructorCount,
    totalInstructors,
  ]);

  const learnerSummaryLabel = React.useMemo(
    () => `${learnerCount} active learner${learnerCount === 1 ? "" : "s"}`,
    [learnerCount],
  );

  // Add dialog uses InstructorForm; it manages its own form state
  const addFormRef = React.useRef<InstructorFormHandle | null>(null);

  const [manageInstructorId, setManageInstructorId] = React.useState<string | null>(null);
  const [manageFormError, setManageFormError] = React.useState<string | null>(null);
  const manageFormRef = React.useRef<InstructorFormHandle | null>(null);

  const selectedInstructor = React.useMemo(
    () =>
      instructors.find((instructor) => instructor.id === manageInstructorId) ??
      null,
    [instructors, manageInstructorId],
  );


  React.useEffect(() => {
    if (!isManageSheetOpen) return;
    if (instructors.length === 0) return;
    setManageInstructorId((current) => current ?? instructors[0]?.id ?? null);
  }, [isManageSheetOpen, instructors]);

  React.useEffect(() => {
    if (!isManageSheetOpen) {
      setManageInstructorId(null);
      setManageFormError(null);
      return;
    }
    if (!selectedInstructor) return;
    setManageFormError(null);
  }, [selectedInstructor, isManageSheetOpen]);

  // No add form local state — InstructorForm handles it

  function handleRemoveSelectedInstructor() {
    if (!selectedInstructor) {
      setManageFormError("Select an instructor to manage.");
      return;
    }
    // console.debug("InstructorBench: invoking handleRemoveInstructor", selectedInstructor.id);
    handleRemoveInstructor(selectedInstructor.id);
    setIsManageSheetOpen(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Instructor Bench</h2>
          <p className="text-sm text-muted-foreground">
            {totalInstructors > 0
              ? `${instructorSummaryLabel}`
              : canManageInstructors
                ? `No instructors on the bench yet. Add mentors or dispatcher instructors to support ${learnerSummaryLabel}.`
                : `No instructors on the bench yet.`}
          </p>
        </div>
        {effectiveCanManageInstructors ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
              Add instructor
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManageSheetOpen(true)}
              disabled={instructors.length === 0}
            >
              Manage instructors
            </Button>
          </div>
        ) : null}
      </div>

      {instructors.length === 0 ? (
        <Card className="border border-dashed border-border/60 shadow-none">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Add mentors or dispatcher instructors to start scheduling live
            classes.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      )}

      {effectiveCanManageInstructors ? (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Add instructor</DialogTitle>
              <DialogDescription>
                Track a new dispatcher instructor or guest SME on your bench.
              </DialogDescription>
            </DialogHeader>
            <InstructorForm
              ref={addFormRef}
              onSubmit={(values) => {
                // console.debug("InstructorBench: invoking handleCreateInstructor", values);
                handleCreateInstructor(values);
                setIsAddDialogOpen(false);
              }}
            />
            <DialogFooter>
              <div className="flex items-center justify-end gap-2 w-full">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => addFormRef.current?.requestSubmit?.()}>
                  Add instructor
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
        <SheetContent side="right" className="max-w-xl">
          <SheetHeader>
            <SheetTitle>Manage instructors</SheetTitle>
            <SheetDescription>
              Make edits to an existing instructor on your bench.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <Label>Selected</Label>
              <div className="mt-2 flex items-center gap-2">
                <Select
                  value={manageInstructorId ?? undefined}
                  onValueChange={(value) => setManageInstructorId(value ?? null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((ins) => (
                      <SelectItem key={ins.id} value={ins.id}>
                        {ins.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedInstructor ? (
              <div>
                <InstructorForm
                  ref={manageFormRef}
                  initial={selectedInstructor}
                  onSubmit={(patch) => {
                    // console.debug("InstructorBench: invoking handleUpdateInstructor", { id: selectedInstructor.id, patch });
                    handleUpdateInstructor(selectedInstructor.id, patch);
                    setIsManageSheetOpen(false);
                  }}
                />
                {manageFormError ? (
                  <p className="mt-2 text-sm text-destructive">{manageFormError}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <SheetFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button variant="destructive" type="button" onClick={handleRemoveSelectedInstructor}>
                  Remove
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button" onClick={() => setIsManageSheetOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => manageFormRef.current?.requestSubmit?.()}
                >
                  Save
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>
  );
}
