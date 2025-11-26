"use client";

import { Building2, Link2, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

import type { OrgPermissions, OrgPod } from "../types";

type OrgPodsPanelProps = {
  pods: OrgPod[];
  permissions?: OrgPermissions;
  onRemovePod?: (podId: string) => Promise<void> | void;
  onLinkPod?: () => void;
};

export function OrgPodsPanel({
  pods,
  permissions,
  onRemovePod,
  onLinkPod,
}: OrgPodsPanelProps) {
  const canManage = permissions?.canManagePods || permissions?.canLinkPods;
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-medium">Pods</h3>
          <p className="text-sm text-muted-foreground">
            Pods linked to this organization. Removing a pod only unlinks it,
            and does not delete the pod.
          </p>
        </div>
        {permissions?.canLinkPods && (
          <div className="flex w-full justify-start sm:w-auto sm:justify-end">
            <Button size="sm" onClick={onLinkPod} className="w-full sm:w-auto">
              <Link2 className="mr-2 h-4 w-4" />
              Link pod
            </Button>
          </div>
        )}
      </div>

      {pods.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No pods linked</CardTitle>
            <CardDescription>
              Link a pod to manage collective calendar and membership access.
            </CardDescription>
          </CardHeader>
          {permissions?.canLinkPods && (
            <CardFooter>
              <Button size="sm" variant="outline" onClick={onLinkPod}>
                Link first pod
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pods.map((pod) => (
            <Card key={pod.id}>
              <CardHeader className="space-y-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{pod.name}</span>
                    </CardTitle>
                    {(pod.area || pod.slug) && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {pod.area && <Badge variant="outline">{pod.area}</Badge>}
                        {pod.slug && (
                          <Badge variant="outline" className="font-mono">
                            {pod.slug}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="self-start"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Unlink ${pod.name}? The pod will remain available for other orgs.`,
                          )
                        ) {
                          onRemovePod?.(pod.id);
                        }
                      }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unlink
                      </Button>
                  )}
                </div>
                {pod.description && (
                  <CardDescription>{pod.description}</CardDescription>
                )}
              </CardHeader>
              {pod.linkedAt && (
                <CardContent className="text-xs text-muted-foreground">
                  Linked {new Date(pod.linkedAt).toLocaleDateString()}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
