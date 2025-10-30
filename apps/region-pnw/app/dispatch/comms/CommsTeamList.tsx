"use client";

import * as React from "react";
import type { ComTeam, ComChannel } from "@workspace/store/types/comms.ts";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

type Props = {
  teams: ComTeam[];
  channels: ComChannel[];
  onCreateTeam?: (team: Omit<ComTeam, 'id'>) => void | Promise<void>;
  onUpdateTeam?: (id: string, patch: Partial<ComTeam>) => void | Promise<void>;
  onDeleteTeam?: (id: string) => void | Promise<void>;
};

export function CommsTeamList({ teams, channels, onCreateTeam, onUpdateTeam, onDeleteTeam }: Props) {
  const [creating, setCreating] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<Partial<ComTeam>>({ name: "", encryption_mode: undefined });

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<ComTeam>>({});

  const startEdit = (t: ComTeam) => {
    setEditingId(t.id);
    setEditForm({ ...t });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const submitCreate = async () => {
    if (!createForm.name?.trim()) return;
    await onCreateTeam?.({
      name: createForm.name!.trim(),
      channel: createForm.channel ?? undefined,
      encryption_mode: (createForm as any).encryption_mode,
      assigned_dispatch_lead: createForm.assigned_dispatch_lead ?? undefined,
      notes: createForm.notes ?? undefined,
      location_label: (createForm as any).location_label ?? undefined,
      location_lat: (createForm as any).location_lat ?? undefined,
      location_lng: (createForm as any).location_lng ?? undefined,
      default_check_in_interval_minutes: createForm.default_check_in_interval_minutes ?? undefined,
    } as any);
    setCreateForm({ name: "", encryption_mode: undefined });
    setCreating(false);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    await onUpdateTeam?.(editingId, editForm as any);
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="rounded-md border p-2">
        {!creating ? (
          <div className="flex items-center justify-between">
            <p className="font-medium">Add Team</p>
            <Button size="sm" variant="outline" onClick={() => setCreating(true)}>New</Button>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="team-name">Name</Label>
              <Input id="team-name" value={createForm.name ?? ''} onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="team-channel">Channel</Label>
              <Input id="team-channel" value={createForm.channel ?? ''} onChange={(e) => setCreateForm((s) => ({ ...s, channel: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="team-location-label">Location Label</Label>
              <Input id="team-location-label" value={(createForm as any).location_label ?? ''} onChange={(e) => setCreateForm((s) => ({ ...s, location_label: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Encryption</Label>
              <Select value={(createForm as any).encryption_mode ?? ''} onValueChange={(v) => setCreateForm((s) => ({ ...s, encryption_mode: v as any }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="AES-256">AES-256</SelectItem>
                  <SelectItem value="Proprietary">Proprietary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="team-interval">Default check-in (min)</Label>
              <Input id="team-interval" type="number" min={5} value={createForm.default_check_in_interval_minutes ?? ''} onChange={(e) => setCreateForm((s) => ({ ...s, default_check_in_interval_minutes: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={submitCreate}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setCreating(false); setCreateForm({ name: "" }); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
      {teams.length === 0 ? (
        <p className="text-muted-foreground">No teams configured.</p>
      ) : (
        teams.map((t) => {
          const teamChannels = channels.filter((c) => c.team_id === t.id);
          return (
            <div key={t.id} className="rounded-md border p-2">
              {editingId === t.id ? (
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label>Name</Label>
                    <Input value={editForm.name ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Channel</Label>
                    <Input value={editForm.channel ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, channel: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Location Label</Label>
                    <Input value={(editForm as any).location_label ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, location_label: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Encryption</Label>
                    <Select value={(editForm as any).encryption_mode ?? ''} onValueChange={(v) => setEditForm((s) => ({ ...s, encryption_mode: v as any }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clear">Clear</SelectItem>
                        <SelectItem value="AES-256">AES-256</SelectItem>
                        <SelectItem value="Proprietary">Proprietary</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label>Default check-in (min)</Label>
                    <Input type="number" min={5} value={editForm.default_check_in_interval_minutes ?? ''} onChange={(e) => setEditForm((s) => ({ ...s, default_check_in_interval_minutes: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {t.assigned_dispatch_lead ? (
                          <div>Lead: {t.assigned_dispatch_lead}</div>
                        ) : null}
                        {t.location_label ? (
                          <div>
                            Loc: {t.location_label}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {t.channel ? `Ch: ${t.channel}` : null}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => startEdit(t)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteTeam?.(t.id)}>Delete</Button>
                    </div>
                  </div>
                  {teamChannels.length ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {teamChannels.map((c) => (
                        <div key={c.id}>Channel: {c.channel_name}{c.frequency ? ` (${c.frequency})` : ''}</div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
