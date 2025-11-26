"use client";

import { Crown, Shield, UserMinus } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import type { OrgMember, OrgPermissions } from "../types";

type OrgMembersPanelProps = {
  members: OrgMember[];
  permissions?: OrgPermissions;
  onAddMember?: () => void;
  onPromote?: (memberId: string) => Promise<void> | void;
  onDemote?: (memberId: string) => Promise<void> | void;
  onRemove?: (memberId: string) => Promise<void> | void;
  onSelectMember?: (member: OrgMember) => void;
};

export function OrgMembersPanel({
  members,
  permissions,
  onAddMember,
  onPromote,
  onDemote,
  onRemove,
  onSelectMember,
}: OrgMembersPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-medium">Members</h3>
          <p className="text-sm text-muted-foreground">
            Promote, demote, or remove members. Only display names are shown to
            avoid exposing PII.
          </p>
        </div>
        {permissions?.canManageMembers && (
          <div className="flex w-full sm:w-auto sm:justify-end">
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={onAddMember}
              disabled={!onAddMember}
            >
              Add member
            </Button>
          </div>
        )}
      </div>

      {members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No members yet</CardTitle>
            <CardDescription>
              Add members through your region workflows. Linked pods also grant
              access to calendar features.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active members</CardTitle>
            <CardDescription>
              Roles and permissions are managed per organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {/* Mobile cards */}
            <div className="grid gap-3 px-4 md:hidden">
              {members.map((member) => (
                <div key={member.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium truncate">{member.displayName}</p>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectMember?.(member)}
                    >
                      {permissions?.canManageMembers ? "Manage" : "View"}
                    </Button>
                  </div>
                  {permissions?.canManageMembers && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 min-w-[100px]"
                        onClick={() => onPromote?.(member.id)}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Promote
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 min-w-[100px]"
                        onClick={() => onDemote?.(member.id)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Demote
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-w-[100px] text-destructive"
                        onClick={() => onRemove?.(member.id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Display name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="pl-6 font-medium">
                        {member.displayName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {permissions?.canManageMembers ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onPromote?.(member.id)}
                              title="Promote"
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onDemote?.(member.id)}
                              title="Demote"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => onRemove?.(member.id)}
                              title="Remove"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectMember?.(member)}
                            >
                              More
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onSelectMember?.(member)}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {permissions?.canManageMembers && (
            <CardFooter className="text-xs text-muted-foreground">
              Role changes update permissions immediately.
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
