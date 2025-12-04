"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/primitives/sheet";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Badge } from "@workspace/ui/primitives/badge";
import { Label } from "@workspace/ui/primitives/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/primitives/command";
import { Check } from "lucide-react";
import { OrgMember, OrgRegisteredUser, OrgRoleOption } from "../orgs";

type OrgMemberActionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrgMember | null;
  roles: OrgRoleOption[];
  mode?: "manage" | "add";
  registeredUsers?: OrgRegisteredUser[];
  onAddMember?: (profileId: string, role: string) => Promise<void> | void;
  onUpdateRole?: (memberId: string, role: string) => Promise<void> | void;
  onRemove?: (memberId: string) => Promise<void> | void;
};

export function OrgMemberActionsSheet({
  open,
  onOpenChange,
  member,
  roles,
  mode = "manage",
  registeredUsers = [],
  onAddMember,
  onUpdateRole,
  onRemove,
}: OrgMemberActionsSheetProps) {
  const getDefaultRole = (list: OrgRoleOption[]) =>
    list.find((role) => role.value === "member")?.value ??
    list[0]?.value ??
    "member";

  const [selectedRole, setSelectedRole] = useState<string>(() =>
    getDefaultRole(roles)
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const addMode = mode === "add";

  useEffect(() => {
    if (!open) {
      setSaving(false);
      return;
    }
    if (addMode) {
      setSelectedRole(getDefaultRole(roles));
      setSelectedProfileId("");
    } else if (member) {
      setSelectedRole(member.role);
    } else if (!selectedRole) {
      setSelectedRole(getDefaultRole(roles));
    }
  }, [addMode, member, open, roles, selectedRole]);

  const selectedUser = registeredUsers.find(
    (user) => user.id === selectedProfileId
  );

  const handleRoleUpdate = async () => {
    if (!member) return;
    if (!selectedRole) {
      toast.error("Choose a role");
      return;
    }
    if (!onUpdateRole) return onOpenChange(false);
    setSaving(true);
    try {
      await onUpdateRole(member.id, selectedRole);
      toast.success("Member role updated");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    const roleToUse = selectedRole || roles[0]?.value;
    if (!selectedProfileId) {
      toast.error("Select a registered user");
      return;
    }
    if (!roleToUse) {
      toast.error("Choose a role");
      return;
    }
    if (!onAddMember) return onOpenChange(false);
    setSaving(true);
    try {
      await onAddMember(selectedProfileId, roleToUse);
      toast.success("Member added");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to add member");
    } finally {
      setSaving(false);
    }
  };

  const sheetTitle = addMode ? "Add member" : "Member actions";
  const sheetDescription = addMode
    ? "Select a registered user to add to this organization and assign their role."
    : "Update the member's role or remove them from the organization.";

  const handleRemove = async () => {
    if (!member || !onRemove) return onOpenChange(false);
    const confirmed = window.confirm(
      `Remove ${member.displayName} from this organization?`
    );
    if (!confirmed) return;
    setSaving(true);
    try {
      await onRemove(member.id);
      toast.success("Member removed");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Unable to remove member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-md bg-card text-card-foreground overflow-y-auto p-3 z-[1200]"
      >
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          {addMode ? (
            <>
              <div className="grid gap-2">
                <Label>Registered users</Label>
                <Command className="rounded-md border bg-background p-2">
                  <CommandInput placeholder="Search people..." />
                  <CommandList>
                    <CommandEmpty>No registered users found.</CommandEmpty>
                    <CommandGroup>
                      {registeredUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.displayName}
                          onSelect={() => setSelectedProfileId(user.id)}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex flex-col text-left">
                              <span className="font-medium">
                                {user.displayName}
                              </span>
                              {user.detail && (
                                <span className="text-xs text-muted-foreground">
                                  {user.detail}
                                </span>
                              )}
                            </div>
                            {selectedProfileId === user.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                {selectedUser && (
                  <div className="text-xs text-muted-foreground">
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {selectedUser.displayName}
                    </span>
                  </div>
                )}
                {!registeredUsers.length && (
                  <p className="text-xs text-muted-foreground">
                    No registered users available to add right now.
                  </p>
                )}
              </div>

              <div className="grid gap-1 p-2 z-[1202]">
                <Label htmlFor="member-role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="z-[1202]" id="member-role">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent className="z-[1202]">
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                          {role.description && (
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleAddMember}
                  disabled={
                    saving || !registeredUsers.length || !selectedProfileId
                  }
                >
                  {saving ? "Adding..." : "Add member"}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : member ? (
            <>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{member.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    Member information is limited to display names to keep PII
                    safe.
                  </p>
                </div>
                <Badge variant="secondary">{member.role}</Badge>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="member-role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="z-[1202]" id="member-role">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent className="z-[1202]">
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                          {role.description && (
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRoleUpdate}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save role"}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleRemove}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
            </>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">
              Select a member to manage actions.
            </div>
          )}
        </div>
        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}
