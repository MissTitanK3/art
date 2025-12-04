"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Label } from "@workspace/ui/primitives/label";

import type { Org, OrgPermissions } from "./types";

type OrgSwitcherProps = {
  userOrgs: Org[];
  permissions?: OrgPermissions;
  activeOrgId?: string | null;
  onOpenOrg?: (orgId: string) => void;
};

export function OrgSwitcher({
  userOrgs,
  activeOrgId,
  onOpenOrg,
}: OrgSwitcherProps) {
  return (
    <div className="grid gap-1">
      <Label htmlFor="org-switcher">Switch organization</Label>
      <Select
        value={activeOrgId ?? undefined}
        onValueChange={(value) => onOpenOrg?.(value)}
      >
        <SelectTrigger id="org-switcher">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {userOrgs.length === 0 ? (
            <SelectItem value="none" disabled>
              No organizations available
            </SelectItem>
          ) : (
            userOrgs.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
