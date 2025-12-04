"use client";

import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { Card } from "@workspace/ui/primitives/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/primitives/dropdown-menu";
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
import { CalendarOrgSummary } from "./collective-calendar-shared";

type CollectiveCalendarAdminPanelProps = {
  organizations: CalendarOrgSummary[];
  hasCreateOrg: boolean;
  hasUpdateOrg: boolean;
  hasDeleteOrg: boolean;
  onOpenOrgDialog: (org?: CalendarOrgSummary) => void;
  onDeleteOrgClick: (orgId: string) => void;
  onManageOrgPods?: (org?: CalendarOrgSummary) => void;
};

export function CollectiveCalendarAdminPanel({
  organizations,
  hasCreateOrg,
  hasUpdateOrg,
  hasDeleteOrg,
  onOpenOrgDialog,
  onDeleteOrgClick,
  onManageOrgPods,
}: CollectiveCalendarAdminPanelProps) {
  const handleConsoleFallback = () => {
    if (onManageOrgPods) {
      onManageOrgPods(organizations[0]);
      return;
    }
    toast.info("Org console", {
      description:
        "Creation + pod membership management opens from the admin console. This is scoped to org roles.",
    });
  };

  return (
    <Card className="border-dashed">
      <div className="flex gap-1 border-b px-3 pb-2 text-sm font-semibold sm:flex-row sm:items-center">
        <Shield className="h-4 w-4" />
        Organization Admin Panel
      </div>
      <div className="space-y-3 p-3 text-sm">
        <p className="text-muted-foreground">
          Dispatchers can group pods under shared organizations, manage roles,
          and set default visibility for new shifts.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <p className="text-sm font-semibold">Your organizations</p>
              <p className="text-xs text-muted-foreground">
                Pod access follows org membership.
              </p>
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
                    className="flex w-full flex-col gap-2 rounded-md border bg-background px-3 py-2"
                  >
                    <div className="flex gap-1 justify-between">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                          <Badge variant="outline" className="w-fit capitalize">
                            {org.role ?? "member"}
                          </Badge>
                          <p className="text-sm font-semibold">{org.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {org.description ?? "No description"}
                          </p>
                        </div>
                      </div>
                      <div>
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
                              {onManageOrgPods && (
                                <DropdownMenuItem
                                  onClick={() => onManageOrgPods(org)}
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Manage pods
                                </DropdownMenuItem>
                              )}
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
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <p className="text-sm font-semibold">Owner actions</p>
              <p className="text-xs text-muted-foreground">
                Manage Pods, roles, and defaults from the org console.
              </p>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {hasCreateOrg && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => onOpenOrgDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Organization
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleConsoleFallback}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Open org console
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() =>
                  toast.info("Visibility defaults for new shifts", {
                    description:
                      "New shifts inherit the org visibility you configure in the org console (Defaults tab). Update it there to change who can see new shifts.",
                  })
                }
              >
                <Layers className="mr-2 h-4 w-4" />
                About visibility defaults
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
