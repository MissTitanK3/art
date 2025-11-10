"use client";

import * as React from "react";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Edit3 } from "lucide-react";
import { RosterEntry } from "@workspace/store/types/pod.ts";
import { RemoveMemberButton } from "../buttons/RemoveMemberButton.tsx";
import { humanize } from "@workspace/ui/lib/utils";

type RosterTableProps = {
  rows: RosterEntry[];
  onEdit?: (id: string) => void;
  podName: string;
  onRemoveMember: (memberId: string) => void;
};

export function RosterTable({
  rows,
  onEdit,
  podName,
  onRemoveMember,
}: RosterTableProps) {
  return (
    <Card className="mt-4 p-0 overflow-hidden">
      {/* Table header (desktop only) */}
      <div className="hidden md:grid grid-cols-12 gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <div className="col-span-3">Handle</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Langs / Skills</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {rows.map((r) => {
        // Treat as Registered when roster entry links to a profile row
        const registered = Boolean(
          r.profile_id && String(r.profile_id).trim().length > 0,
        );

        return (
          <div
            key={r.id}
            className="grid md:grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0"
          >
            {/* Handle + mobile summary */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.handle}</span>
                <Badge
                  variant={registered ? "default" : "outline"}
                  className={
                    registered
                      ? "bg-emerald-500/15 text-emerald-800"
                      : "text-muted-foreground"
                  }
                >
                  {registered ? "Registered" : "Manual"}
                </Badge>
              </div>
              {r.signal_handle && (
                <div className="text-xs text-muted-foreground">
                  📱 {r.signal_handle}
                </div>
              )}
              <div className="mt-1 flex items-center gap-2 md:hidden">
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
              <div className="mt-1 text-xs text-muted-foreground md:hidden">
                <div>
                  Langs:{" "}
                  {r.langs?.length
                    ? r.langs.map((l) => l.display_name).join(", ")
                    : "—"}
                </div>
                <div>
                  Skills: {r.skills?.length ? r.skills.join(", ") : "—"}
                </div>
                {r.lastShiftAt && (
                  <div>
                    Last shift: {new Date(r.lastShiftAt).toLocaleDateString()}
                  </div>
                )}
                {r.notes && <div className="italic">“{r.notes}”</div>}
              </div>
            </div>

            {/* Desktop role/status/langs */}
            <div className="hidden md:block md:col-span-2 self-center">
              <Badge variant="secondary">{humanize(r.role)}</Badge>
            </div>
            <div className="hidden md:block md:col-span-2 self-center">
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
            <div className="hidden md:block md:col-span-3 self-center text-sm text-muted-foreground">
              <div>
                Langs:{" "}
                {r.langs?.length
                  ? r.langs.map((l) => l.display_name).join(", ")
                  : "—"}
              </div>
              <div>Skills: {r.skills?.length ? r.skills.join(", ") : "—"}</div>
              {r.certs?.length > 0 && (
                <div>
                  Certs:{" "}
                  {r.certs
                    .map((c) => `${c.display_name} (${c.level ?? "n/a"})`)
                    .join(", ")}
                </div>
              )}
              {r.lastShiftAt && (
                <div>
                  Last shift: {new Date(r.lastShiftAt).toLocaleDateString()}
                </div>
              )}
              {r.notes && <div className="italic">“{r.notes}”</div>}
            </div>

            {/* Actions */}
            <div className="w-full grid grid-cols-2 gap-2 md:grid-cols-1">
              <RemoveMemberButton
                podName={podName}
                member={r}
                onRemoveMember={() => onRemoveMember(r.id)}
              />
              {onEdit && (
                <Button
                  onClick={() => onEdit(r.id)}
                  size="sm"
                  variant="outline"
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
