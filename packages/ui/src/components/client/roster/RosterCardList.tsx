"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Edit3, Radio } from "lucide-react";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import { RemoveMemberButton } from "../buttons/RemoveMemberButton.tsx";
import { humanize } from "@workspace/ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { toast } from "sonner";

type Props = {
  rows: RosterEntry[];
  podName: string;
  onRemoveMember: (memberId: string) => void;
  onEdit?: (id: string) => void;
};

export function RosterCardList({ rows, podName, onRemoveMember, onEdit }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => {
        const registered = Boolean(r.profile?.user_id && r.profile.user_id.trim().length > 0);
        return (
          <Card key={r.id} className="flex flex-col mt-2 shadow-sm">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{r.handle}</CardTitle>
                  {r.signal_handle && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(r.signal_handle!);
                            toast.success("Signal handle copied to clipboard ✅");
                          }}
                          className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Radio className="h-5 w-5" /> {r.signal_handle}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Click to copy</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <hr />
                <div className="flex items-center gap-2 justify-between w-full">
                  <Badge
                    variant={registered ? "default" : "outline"}
                    className={registered ? "bg-emerald-500/15 text-emerald-800" : "text-muted-foreground"}
                  >
                    {registered ? "Registered" : "Manual Entry"}
                  </Badge>
                  <Badge variant="secondary">{humanize(r.role)}</Badge>
                  <Badge
                    variant={
                      r.status === "active"
                        ? "default"
                        : r.status === "suspended"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {humanize(r.status)}
                  </Badge>
                </div>
                <hr />
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {r.langs?.length > 0 && (
                <div>
                  <span className="font-medium text-foreground">Languages:</span>{" "}
                  {r.langs.map((l) => l.display_name).join(", ")}
                </div>
              )}

              {r.skills?.length > 0 && (
                <div>
                  <p className="font-medium text-foreground">Skills:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {r.skills.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {r.certs?.length > 0 && (
                <div>
                  <p className="font-medium text-foreground">Certifications:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {r.certs.map((c) => (
                      <li key={c.id}>
                        {c.display_name}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({c.level ?? "n/a"})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.lastShiftAt && (
                <div>
                  <span className="font-medium text-foreground">Last Shift:</span>{" "}
                  {new Date(r.lastShiftAt).toLocaleDateString()}
                </div>
              )}

              {r.notes && (
                <div>
                  <span className="font-medium text-foreground">Notes:</span>{" "}
                  <span className="italic">“{r.notes}”</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2 justify-end">
              <RemoveMemberButton podName={podName} member={r} onRemoveMember={() => onRemoveMember(r.id)} />
              {onEdit && (
                <Button size="sm" variant="outline" onClick={() => onEdit(r.id)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
