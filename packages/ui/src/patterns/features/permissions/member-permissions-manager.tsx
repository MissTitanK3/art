"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { ScrollArea } from "@workspace/ui/primitives/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/primitives/sheet";
import { Users } from "lucide-react";
import type { DispatchSubmission, DispatchPermissionLayer } from "@workspace/store/types/global.ts";
import type { RosterEntry } from "@workspace/store/types/pod.ts";

type MemberPermissionsManagerProps = {
  submission: DispatchSubmission;
  roster: RosterEntry[];
  onUpdate: (patch: Partial<DispatchSubmission>) => void;
  canManage: boolean;
};

const PERMISSION_PRESETS: Array<{
  key: string;
  label: string;
  description: string;
  layers: DispatchPermissionLayer[];
}> = [
    {
      key: "default",
      label: "Default (role-based)",
      description: "Inherit access from the member's platform role",
      layers: [],
    },
    {
      key: "awareness",
      label: "Awareness only",
      description: "Basic details: location, event date, urgency, status",
      layers: ["awareness"],
    },
    {
      key: "planning",
      label: "Planning (with awareness)",
      description: "Operational details: intended actions, logistics, updates",
      layers: ["awareness", "planning"],
    },
    {
      key: "coordination",
      label: "Coordination (with planning)",
      description: "Sensitive info: notes, Signal links, roster management",
      layers: ["awareness", "planning", "coordination"],
    },
    {
      key: "full",
      label: "Full (includes outcomes)",
      description: "Impact metrics: people served, resources distributed",
      layers: ["awareness", "planning", "coordination", "outcomes"],
    },
  ];

const canonicalize = (layers: DispatchPermissionLayer[]) =>
  Array.from(new Set(layers)).sort();

const presetForLayers = (layers: DispatchPermissionLayer[]) => {
  const normalized = canonicalize(layers);
  const match = PERMISSION_PRESETS.find(
    (preset) =>
      preset.layers.length === normalized.length &&
      canonicalize(preset.layers).every((l, idx) => l === normalized[idx]),
  );
  return match?.key ?? "custom";
};

export function MemberPermissionsManager({
  submission,
  roster,
  onUpdate,
  canManage,
}: MemberPermissionsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<
    Record<string, DispatchPermissionLayer[]>
  >(submission.member_permissions ?? {});

  const assignedMembers = useMemo(
    () =>
      (submission.assigned_volunteers ?? [])
        .map((av) => {
          const profileId = av.profile?.id || av.id;
          const rosterEntry = roster.find(
            (r) => r.profile?.id === profileId || r.id === profileId,
          );
          return {
            profileId: profileId ? String(profileId) : undefined,
            name:
              av.profile?.display_name ||
              rosterEntry?.profile?.display_name ||
              "Unknown",
            role: av.role,
          };
        })
        .filter((m) => m.profileId)
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [submission.assigned_volunteers, roster],
  );

  const handleSelectChange = (profileId: string, presetKey: string) => {
    setEditingPermissions((prev) => {
      if (presetKey === "default") {
        const { [profileId]: _, ...rest } = prev;
        return rest;
      }

      const preset = PERMISSION_PRESETS.find((p) => p.key === presetKey);
      if (!preset) return prev;

      return {
        ...prev,
        [profileId]: preset.layers,
      };
    });
  };

  const handleSave = () => {
    onUpdate({ member_permissions: editingPermissions });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditingPermissions(submission.member_permissions ?? {});
    setIsOpen(false);
  };

  const membersWithOverrides = Object.keys(editingPermissions ?? {}).length;

  if (!canManage) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Manage Member Access
          {membersWithOverrides > 0 ? (
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {membersWithOverrides} custom
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 bg-card text-card-foreground max-w-2xl z-[1200]">
        <SheetHeader className="border-b bg-muted/30">
          <SheetTitle>Manage Member Permissions</SheetTitle>
          <SheetDescription>
            Grant specific permission levels to assigned dispatch members. By default, members inherit permissions based on their platform role.
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col">
          <div className="px-4 py-3 border-b bg-muted/20 text-xs text-muted-foreground">
            Tip: Use the selector per member to quickly set the right access. Defaults fall back to the member's platform role.
          </div>

          <ScrollArea className="flex-1">
            {assignedMembers.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No members assigned yet. Assign members in the Roles tab first.
              </div>
            ) : (
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  {assignedMembers.map((member) => {
                    if (!member.profileId) return null;

                    const permissions = editingPermissions[member.profileId] ?? [];
                    const presetKey = presetForLayers(permissions);
                    const presetLabel =
                      PERMISSION_PRESETS.find((p) => p.key === presetKey)?.label ??
                      "Custom";

                    return (
                      <Card key={member.profileId} className="border">
                        <CardHeader className="pb-2">
                          {permissions.length > 0 ? (
                            <Badge variant="secondary" className="text-[11px] whitespace-nowrap">
                              {presetLabel}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] whitespace-nowrap">
                              Default
                            </Badge>
                          )}
                          <div className="flex items-start justify-between gap-2 mt-1">
                            <div className="space-y-1 flex flex-col md:flex-row md:items-center md:gap-4 text-center align-middle items-center">
                              <CardTitle className="text-sm font-semibold">
                                {member.name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground capitalize">
                                Role: {member.role}
                              </p>
                              <p className="text-[11px] text-muted-foreground">ID: {member.profileId}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Select
                            value={presetKey}
                            onValueChange={(value) =>
                              handleSelectChange(member.profileId!, value)
                            }
                          >
                            <SelectTrigger className="w-full z-[12300] h-auto min-h-[4.5rem] items-start text-left">
                              <SelectValue placeholder="Select access" className="py-4 whitespace-normal break-words leading-snug text-left" />
                            </SelectTrigger>
                            <SelectContent className="z-[1300] max-w-[18rem]">
                              {PERMISSION_PRESETS.map((preset) => (
                                <SelectItem key={preset.key} value={preset.key}>
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-sm font-medium">{preset.label}</span>
                                    <span className="text-[11px] text-muted-foreground whitespace-normal break-words leading-snug text-left">
                                      {preset.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                              {presetKey === "custom" ? (
                                <SelectItem value="custom" disabled>
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-sm font-medium">Custom (unchanged)</span>
                                    <span className="text-[11px] text-muted-foreground">
                                      Currently: {canonicalize(permissions).join(", ") || "Default"}
                                    </span>
                                  </div>
                                </SelectItem>
                              ) : null}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </ScrollArea>

          <SheetFooter className="border-t sticky bottom-0 bg-card">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Permissions
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
