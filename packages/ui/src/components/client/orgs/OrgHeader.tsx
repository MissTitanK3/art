"use client";

import { Building2, Eye, Lock, Shield, Users } from "lucide-react";
import type { ElementType } from "react";

import { Badge } from "@workspace/ui/components/badge";

import type { Org } from "./types";
import type { VisibilityScope } from "@workspace/store/utils/permissions/types";
import { cn } from "@workspace/ui/lib/utils";

type VisibilityChipMeta = {
  label: string;
  icon: ElementType;
  tone: "default" | "secondary" | "outline" | "destructive";
  className?: string;
};

const VISIBILITY_META: Partial<Record<VisibilityScope, VisibilityChipMeta>> = {
  private: { label: "Private", icon: Lock, tone: "secondary", className: "bg-rose-50 text-rose-700 border-rose-200" },
  only_myself: { label: "Only me", icon: Lock, tone: "secondary", className: "bg-rose-50 text-rose-700 border-rose-200" },
  manually_selected: { label: "Selected users", icon: Users, tone: "secondary", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  pod_specific: { label: "Pod", icon: Shield, tone: "outline", className: "bg-sky-50 text-sky-700 border-sky-200" },
  pods_general: { label: "All pods", icon: Shield, tone: "outline", className: "bg-sky-50 text-sky-700 border-sky-200" },
  org_specific: { label: "Organization", icon: Users, tone: "secondary", className: "bg-blue-50 text-blue-700 border-blue-200" },
  orgs_general: { label: "All orgs", icon: Eye, tone: "secondary", className: "bg-blue-50 text-blue-700 border-blue-200" },
  regional: { label: "Regional", icon: Eye, tone: "default", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

type OrgHeaderProps = {
  org: Org;
  userRole?: string | null;
};

export function OrgHeader({
  org,
  userRole,
}: OrgHeaderProps) {
  const visibilityMeta =
    (org.visibilityScope && VISIBILITY_META[org.visibilityScope as VisibilityScope]) ||
    VISIBILITY_META.org_specific!;
  const VisibilityIcon = visibilityMeta.icon;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {visibilityMeta && (
          <Badge
            variant={visibilityMeta.tone}
            className={cn("flex items-center gap-1 text-xs", visibilityMeta.className)}
          >
            <VisibilityIcon className="h-3 w-3" />
            {visibilityMeta.label}
          </Badge>
        )}
        <Building2 className="h-6 w-6" />
        <span>Organization</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold leading-tight">
              {org.name}
            </h2>
            {userRole && (
              <Badge variant="secondary" className="text-xs">
                {userRole}
              </Badge>
            )}
          </div>
          {org.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {org.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
