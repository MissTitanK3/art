"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@workspace/ui/components/drawer";
import type { MeetANeed, NeedStatus, NeedUrgency, NeedVisibility } from "@workspace/store/types/meet-a-need";

type OfferPayload = { resource_type: "time" | "transport" | "supplies" | "funding" | "other"; notes?: string };

type NeedsListProps = {
  needs: MeetANeed[];
  onOfferHelp: (needId: string, payload: OfferPayload) => Promise<void> | void;
  onUpdateStatus: (needId: string, status: NeedStatus) => Promise<void> | void;
  onUpdateNeed: (
    needId: string,
    patch: Partial<Pick<MeetANeed, "category" | "description" | "urgency" | "visibility" | "contact_preference" | "location">> & { locationLabel?: string }
  ) => Promise<void> | void;
  onDeleteNeed: (needId: string) => Promise<void> | void;
  canManageStatus?: boolean;
  canManageNeed?: boolean;
};

export default function NeedsList({ needs, onOfferHelp, onUpdateStatus, onUpdateNeed, onDeleteNeed, canManageStatus = true, canManageNeed = true }: NeedsListProps) {
  const [viewerUrl, setViewerUrl] = React.useState<string | null>(null);
  if (!needs?.length) {
    return <p className="text-sm text-muted-foreground">No needs yet. Be the first to post one.</p>;
  }
  return (
    <div className="space-y-3">
      {needs.map((n) => (
        <Card key={n.id}>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>{n.category}</span>
              <div className="flex items-center gap-2">

              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm whitespace-pre-wrap">{n.description}</p>
            {Array.isArray((n as any).location?.media) && (n as any).location.media.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(n as any).location.media.map((url: string, idx: number) => (
                  <div key={idx} className="flex flex-col items-start gap-1">
                    <button type="button" onClick={() => setViewerUrl(url)} className="w-full">
                      <img
                        src={url}
                        alt={`need-${n.id}-media-${idx}`}
                        className="w-full h-40 object-cover rounded border"
                      />
                    </button>
                    <a href={url} download className="text-xs text-blue-600 underline">Download</a>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Visibility: {n.visibility}</span>
                {n.location?.label ? (
                  <>
                    <span>•</span>
                    <span>Where: {n.location.label}</span>
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-2">

              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-start">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {canManageStatus ? (
                    <Select value={n.status} onValueChange={(v) => onUpdateStatus(n.id, v as NeedStatus)}>
                      <SelectTrigger size="sm" className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="fulfilled">Fulfilled</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs rounded px-2 py-0.5 border capitalize">{n.status}</span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs text-muted-foreground">Urgency</span>
                  {canManageNeed ? (
                    <Select value={n.urgency} onValueChange={(v) => onUpdateNeed(n.id, { urgency: v as NeedUrgency })}>
                      <SelectTrigger size="sm" className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs rounded px-2 py-0.5 border capitalize">{n.urgency}</span>
                  )}
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2 sm:justify-end self-end">
                  {canManageNeed ? (
                    <>
                      <EditNeedDrawer
                        need={n}
                        onSave={(patch) => onUpdateNeed(n.id, patch)}
                      />
                      <Button size="sm" variant="destructive" onClick={() => onDeleteNeed(n.id)}>Delete</Button>
                    </>
                  ) : null}
                </div>
              </div>
              <OfferHelpButton needId={n.id} onOfferHelp={onOfferHelp} />
              <div className="text-xs font-medium text-muted-foreground">Thread</div>
              {Array.isArray(n.responders) && n.responders.length > 0 ? (
                <div className="space-y-2">
                  {n.responders
                    .slice()
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((r, idx) => (
                      <div key={`${r.profile_id}-${idx}`} className="rounded border p-2">
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Responder</span>
                          <span>{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="mr-2 inline-block rounded border px-2 py-0.5 text-xs capitalize">{r.resource_type}</span>
                          {r.notes ? <span className="text-sm">{r.notes}</span> : null}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No responses yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {/* Image viewer */}
      <Drawer open={!!viewerUrl} onOpenChange={(o) => { if (!o) setViewerUrl(null); }}>
        <DrawerContent className="p-4 max-w-5xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>Image</DrawerTitle>
            <DrawerDescription>Tap download to save or share.</DrawerDescription>
          </DrawerHeader>
          <div className="p-2 flex items-center justify-center overflow-auto">
            {viewerUrl ? (
              <img src={viewerUrl} alt="full-view" className="max-h-[70vh] w-auto object-contain rounded border" />
            ) : null}
          </div>
          <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
            {viewerUrl ? (
              <Button asChild>
                <a href={viewerUrl} download>Download</a>
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => setViewerUrl(null)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function EditNeedDrawer({
  need,
  onSave,
}: {
  need: MeetANeed;
  onSave: (patch: Partial<Pick<MeetANeed, "category" | "description" | "urgency" | "visibility" | "contact_preference" | "location">> & { locationLabel?: string }) => void | Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState(need.category);
  const [description, setDescription] = React.useState(need.description);
  const [urgency, setUrgency] = React.useState<NeedUrgency>(need.urgency);
  const [visibility, setVisibility] = React.useState<NeedVisibility>(need.visibility);
  const [locationLabel, setLocationLabel] = React.useState(need.location?.label ?? "");
  const [contact, setContact] = React.useState(need.contact_preference ?? "");
  const [pending, setPending] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await onSave({ category, description, urgency, visibility, contact_preference: contact, locationLabel });
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Edit</Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
          <DrawerHeader>
            <DrawerTitle>Edit Need</DrawerTitle>
            <DrawerDescription>Update fields for this need.</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSave} className="space-y-3 p-1">
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Urgency</Label>
                <Select value={urgency} onValueChange={(v) => setUrgency(v as NeedUrgency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as NeedVisibility)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="region">Region only</SelectItem>
                    <SelectItem value="pod">Pod/dispatchers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Location (optional)</Label>
              <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contact preference (optional)</Label>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={pending}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function OfferHelpButton({ needId, onOfferHelp }: { needId: string; onOfferHelp: NeedsListProps["onOfferHelp"] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>I can help</Button>
      ) : (
        <OfferHelpForm needId={needId} onClose={() => setOpen(false)} onOfferHelp={onOfferHelp} />
      )}
    </div>
  );
}

function OfferHelpForm({ needId, onClose, onOfferHelp }: { needId: string; onClose: () => void; onOfferHelp: NeedsListProps["onOfferHelp"] }) {
  const [pending, setPending] = React.useState(false);
  const [resourceType, setResourceType] = React.useState<OfferPayload["resource_type"]>("time");
  const [notes, setNotes] = React.useState("");

  const submit = async () => {
    setPending(true);
    try {
      await onOfferHelp(needId, { resource_type: resourceType, notes });
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="border rounded p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs">Resource</label>
          <Select value={resourceType} onValueChange={(v) => setResourceType(v as OfferPayload["resource_type"])}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="funding">Funding</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs">Notes</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={pending} onClick={submit}>Offer Help</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
