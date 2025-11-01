"use client";

import * as React from "react";
import type { ComBriefing } from "@workspace/store/types/comms.ts";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";

type Props = {
  briefing: ComBriefing | null;
  onSave?: (patch: Partial<ComBriefing>) => void | Promise<void>;
};

export function CommsBriefing({ briefing, onSave }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState<Partial<ComBriefing>>({});

  React.useEffect(() => {
    if (briefing) setForm(briefing);
  }, [briefing]);

  const save = async () => {
    await onSave?.({
      overview: form.overview ?? '',
      comms_plan: form.comms_plan ?? '',
      safety_notes: form.safety_notes ?? '',
      updates: form.updates ?? '',
    });
    setEditing(false);
  };

  const hasBrief = Boolean(briefing && (briefing.overview || briefing.comms_plan || briefing.safety_notes || briefing.updates));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Briefing</CardTitle>
        {onSave ? (
          <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Cancel' : hasBrief ? 'Edit' : 'Create'}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {editing ? (
          <>
            <div className="grid gap-1">
              <Label>Overview</Label>
              <Textarea value={form.overview ?? ''} onChange={(e) => setForm((s) => ({ ...s, overview: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Comms Plan</Label>
              <Textarea value={form.comms_plan ?? ''} onChange={(e) => setForm((s) => ({ ...s, comms_plan: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Safety Notes</Label>
              <Textarea value={form.safety_notes ?? ''} onChange={(e) => setForm((s) => ({ ...s, safety_notes: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Latest Updates</Label>
              <Textarea value={form.updates ?? ''} onChange={(e) => setForm((s) => ({ ...s, updates: e.target.value }))} />
            </div>
            <div>
              <Button size="sm" onClick={save}>Save Briefing</Button>
            </div>
          </>
        ) : hasBrief && briefing ? (
          <>
            {briefing.overview ? (
              <div>
                <p className="font-medium">Overview</p>
                <p className="text-muted-foreground">{briefing.overview}</p>
              </div>
            ) : null}
            {briefing.comms_plan ? (
              <div>
                <p className="font-medium">Comms Plan</p>
                <p className="text-muted-foreground">{briefing.comms_plan}</p>
              </div>
            ) : null}
            {briefing.safety_notes ? (
              <div>
                <p className="font-medium">Safety Notes</p>
                <p className="text-muted-foreground">{briefing.safety_notes}</p>
              </div>
            ) : null}
            {briefing.updates ? (
              <div>
                <p className="font-medium">Latest Updates</p>
                <p className="text-muted-foreground">{briefing.updates}</p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground">No briefing created yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default CommsBriefing;

