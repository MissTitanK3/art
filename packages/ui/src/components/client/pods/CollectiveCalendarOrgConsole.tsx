"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Switch } from "@workspace/ui/components/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Badge } from "@workspace/ui/components/badge";
import { CalendarOrgSummary, CalendarPodSummary } from "./CollectiveCalendarShared";
import { Link2, Pencil, Plus, Trash2 } from "lucide-react";

export type OrgPodFormInput = {
  name: string;
  area?: string | null;
};

type CollectiveCalendarOrgConsoleProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  org: CalendarOrgSummary | null;
  pods: CalendarPodSummary[];
  allPods: CalendarPodSummary[];
  onLinkPod?: (orgId: string, podId: string) => Promise<void>;
  onRemovePod?: (
    orgId: string,
    podId: string,
    options?: { hardDelete?: boolean },
  ) => Promise<void>;
};

const emptyForm: OrgPodFormInput = { name: "", area: "" };
const manageRoles = new Set(["owner", "admin"]);
const editRoles = new Set(["owner", "admin", "editor"]);

export function CollectiveCalendarOrgConsole({
  open,
  onOpenChange,
  org,
  pods,
  allPods,
  onLinkPod,
  onRemovePod,
}: CollectiveCalendarOrgConsoleProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    pod: CalendarPodSummary;
    hardDelete: boolean;
  } | null>(null);
  const [selectedPodId, setSelectedPodId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [editingPod, setEditingPod] = useState<CalendarPodSummary | null>(null);

  const availablePods = useMemo(() => {
    const taken = new Set((pods ?? []).map((p) => p.id));
    return allPods.filter((pod) => !taken.has(pod.id));
  }, [allPods, pods]);

  const canManage = org?.role ? manageRoles.has(org.role) : false;

  const handleLink = async () => {
    if (!org || !onLinkPod) return;
    if (!selectedPodId) {
      toast.error("Select a pod to link");
      return;
    }
    setSubmitting(true);
    try {
      await onLinkPod(org.id, selectedPodId);
      toast.success("Pod linked");
      setLinkOpen(false);
      setSelectedPodId("");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to link pod");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!org || !removeTarget || !onRemovePod) return;
    setSubmitting(true);
    try {
      await onRemovePod(org.id, removeTarget.pod.id, {
        hardDelete: removeTarget.hardDelete,
      });
      toast.success(
        removeTarget.hardDelete ? "Pod removed (delete requested)" : "Pod removed",
      );
      setRemoveTarget(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to remove pod");
    } finally {
      setSubmitting(false);
    }
  };

  const resetSheet = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditingPod(null);
      setRemoveTarget(null);
      setLinkOpen(false);
      setSelectedPodId("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={resetSheet}>
      <SheetContent className="flex w-full flex-col gap-4 overflow-hidden sm:max-w-2xl bg-card text-card-foreground z-[1100] p-4">
        <SheetHeader>
          <SheetTitle>Organization console</SheetTitle>
          <SheetDescription>
            {org
              ? `Manage pods for ${org.name}.`
              : "Select an organization to manage its pods."}
          </SheetDescription>
        </SheetHeader>
        {org ? (
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-semibold">{org.name}</p>
              <p className="text-muted-foreground">{org.description ?? "No description"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="capitalize">
                  Role: {org.role ?? "viewer"}
                </Badge>
                <span>{pods.length} pod{pods.length === 1 ? "" : "s"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setLinkOpen(true)}
                disabled={!canManage || !onLinkPod || availablePods.length === 0}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Link existing
              </Button>
            </div>
            <ScrollArea className="flex-1 rounded-md border">
              <div className="divide-y">
                {pods.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No pods are linked to this organization yet.
                  </div>
                ) : (
                  pods.map((pod) => (
                    <div
                      key={pod.id}
                      className="flex items-center justify-between gap-3 p-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{pod.name}</p>
                        <p className="text-muted-foreground">
                          {pod.area ?? "Unassigned area"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setRemoveTarget({ pod, hardDelete: false })
                          }
                          disabled={!canManage || !onRemovePod}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              Choose an organization from the admin panel to manage its pods.
            </p>
          </div>
        )}
      </SheetContent>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="bg-card text-card-foreground z-[1100]">
          <DialogHeader>
            <DialogTitle>Link existing pod</DialogTitle>
            <DialogDescription>Select a pod that already exists.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {availablePods.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All pods are already linked to this organization.
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Pod</Label>
                <Select
                  value={selectedPodId}
                  onValueChange={(value) => setSelectedPodId(value)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pod" />
                  </SelectTrigger>
                  <SelectContent className="z-[1300]">
                    {availablePods.map((pod) => (
                      <SelectItem key={pod.id} value={pod.id}>
                        {pod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setLinkOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleLink}
              disabled={!canManage || !selectedPodId || submitting || availablePods.length === 0}
            >
              {submitting ? "Linking..." : "Link pod"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => (open ? null : setRemoveTarget(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove pod from organization?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.pod.name ?? "This pod"} will lose access to this organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-sm">
            <div>
              <p className="font-medium">Delete pod entirely</p>
              <p className="text-muted-foreground">
                If no other orgs link this pod, attempt to delete it after removal.
              </p>
            </div>
            <Switch
              checked={removeTarget?.hardDelete ?? false}
              onCheckedChange={(value) =>
                setRemoveTarget((prev) => (prev ? { ...prev, hardDelete: value } : prev))
              }
              disabled={!canManage}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} onClick={() => setRemoveTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={submitting || !canManage || !onRemovePod}>
              {submitting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
