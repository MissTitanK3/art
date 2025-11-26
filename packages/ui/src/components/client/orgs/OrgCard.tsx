"use client";

import { Building2, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import type { Org, OrgMember, OrgPod } from "./types";

type OrgCardProps = {
  org: Org;
  pods?: OrgPod[];
  members?: OrgMember[];
  userRole?: string | null;
  onOpen?: (org: Org) => void;
};

export function OrgCard({
  org,
  pods = [],
  members = [],
  userRole,
  onOpen,
}: OrgCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {org.name}
            </CardTitle>
            {org.description && (
              <CardDescription className="line-clamp-2">
                {org.description}
              </CardDescription>
            )}
          </div>
          {userRole && (
            <Badge variant="secondary" className="self-start">
              {userRole}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{members.length} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          <span>{pods.length} pods</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => onOpen?.(org)}>
          Open dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
