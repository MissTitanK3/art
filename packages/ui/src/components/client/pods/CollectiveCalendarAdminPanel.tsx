"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CalendarOrgSummary } from "./CollectiveCalendarShared";

type CollectiveCalendarAdminPanelProps = {
  organizations: CalendarOrgSummary[];
  hasCreateOrg: boolean;
  hasUpdateOrg: boolean;
  hasDeleteOrg: boolean;
  onOpenOrgDialog: (org?: CalendarOrgSummary) => void;
  onDeleteOrgClick: (orgId: string) => void;
};

export function CollectiveCalendarAdminPanel({
  organizations,
  hasCreateOrg,
  hasUpdateOrg,
  hasDeleteOrg,
  onOpenOrgDialog,
  onDeleteOrgClick,
}: CollectiveCalendarAdminPanelProps) {
  return (
    <Card className="border-dashed">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold">
        <Shield className="h-4 w-4" />
        Organization admin panel
      </div>
      <div className="space-y-3 p-3 text-sm">
        <p className="text-muted-foreground">
          Owners/Admins can group pods under shared organizations, manage roles,
          and set default visibility for new shifts.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Your organizations</p>
                <p className="text-xs text-muted-foreground">
                  Pod access follows org membership.
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {organizations.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No organizations yet.
                </p>
              ) : (
                organizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.role ?? "Viewer"} •{" "}
                        {org.description ?? "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {org.role ?? "member"}
                      </Badge>
                      {(hasUpdateOrg || hasDeleteOrg) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {hasUpdateOrg && (
                              <DropdownMenuItem
                                onClick={() => onOpenOrgDialog(org)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasDeleteOrg && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDeleteOrgClick(org.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-sm font-semibold">Owner actions</p>
            <p className="text-xs text-muted-foreground">
              Manage Pods, roles, and defaults from the org console.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {hasCreateOrg && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenOrgDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Organization
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.info("Org console", {
                    description:
                      "Creation + pod membership management opens from the admin console. This is scoped to org roles.",
                  })
                }
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Open org console
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Default visibility", {
                    description:
                      "Org-level visibility defaults will apply to new shifts.",
                  })
                }
              >
                <Layers className="mr-2 h-4 w-4" />
                Set default visibility
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
