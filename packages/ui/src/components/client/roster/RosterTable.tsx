"use client";

import * as React from "react";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Edit3 } from "lucide-react";
import { RosterEntry } from "@workspace/store/types/pod.ts";

type RosterTableProps = {
  rows: RosterEntry[];
  onEdit?: (id: string) => void;
};

export function RosterTable({ rows, onEdit }: RosterTableProps) {
  return (
    <Card className="mt-4 p-0 overflow-hidden">
      {/* Table header (desktop only) */}
      <div className="hidden md:grid grid-cols-12 gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <div className="col-span-4">Handle</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Langs / Skills</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {rows.map((r) => (
        <div
          key={r.id}
          className="grid md:grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0"
        >
          {/* Handle + mobile summary */}
          <div className="md:col-span-4">
            <div className="font-medium">{r.handle}</div>
            <div className="mt-1 flex items-center gap-2 md:hidden">
              <Badge variant="secondary">{r.role}</Badge>
              <Badge
                variant={r.status === "active" ? "default" : "secondary"}
              >
                {r.status}
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
            </div>
          </div>

          {/* Desktop role/status/langs */}
          <div className="hidden md:block md:col-span-2 self-center">
            <Badge variant="secondary">{r.role}</Badge>
          </div>
          <div className="hidden md:block md:col-span-2 self-center">
            <Badge
              variant={r.status === "active" ? "default" : "secondary"}
            >
              {r.status}
            </Badge>
          </div>
          <div className="hidden md:block md:col-span-3 self-center text-sm text-muted-foreground">
            <div>
              Langs:{" "}
              {r.langs?.length
                ? r.langs.map((l) => l.display_name).join(", ")
                : "—"}
            </div>
            <div>
              Skills: {r.skills?.length ? r.skills.join(", ") : "—"}
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-1 text-right">
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
      ))}
    </Card>
  );
}
