"use client";

import * as React from "react";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";

export type VetMethod = "photo" | "video" | "livestream" | "dispatcher_network" | "other";
export type Direction =
  | "North"
  | "NorthEast"
  | "East"
  | "SouthEast"
  | "South"
  | "SouthWest"
  | "West"
  | "NorthWest";

export const DIRECTIONS: Direction[] = [
  "North",
  "NorthEast",
  "East",
  "SouthEast",
  "South",
  "SouthWest",
  "West",
  "NorthWest",
];

export const AGENCY_OPTIONS: string[] = [
  "ICE",
  "Police",
  "State Police",
  "Sheriff",
  "Border Patrol",
  "Immigration Court",
  "Detention Facility",
  "Unmarked",
  "Military",
];

const agencyColors: Record<string, string> = {
  ICE: "bg-cyan-700",
  Police: "bg-green-700",
  "State Police": "bg-green-700",
  Sheriff: "bg-yellow-700",
  "Border Patrol": "bg-orange-700",
  "Immigration Court": "bg-pink-600",
  "Detention Facility": "bg-red-700",
  Unmarked: "bg-gray-700",
  Military: "bg-amber-700",
  Other: "bg-slate-600",
};

export type ConfirmedWatchPayload = {
  timestamp: string;
  agency_type: string[] | null;
  agency_other: string | null;
  location: { lat: number; lng: number };
  media_url: string | null;
  officer_moving: boolean | null;
  officer_direction: Direction | null;
  lights_on: boolean | null;
  sirens_on: boolean | null;
  vet_method: VetMethod | null;
  vet_notes: string | null;
  submitted_by?: string | null;
  test: boolean;
};

type Props = {
  onSubmit?: (payload: ConfirmedWatchPayload) => void | Promise<unknown>;
  submittedBy?: string | null; // optional id to record
  supabaseUrl?: string; // optional; used if onSubmit is not provided
  supabaseAnonKey?: string; // optional; used if onSubmit is not provided
  className?: string;
};

export function ConfirmedWatchForm({ onSubmit, submittedBy, supabaseUrl, supabaseAnonKey, className }: Props) {
  // Helpers for date input formatting (for type="datetime-local")
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const toLocalInputValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const [agencyType, setAgencyType] = React.useState<string[]>([]);
  const [agencyOther, setAgencyOther] = React.useState("");
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);
  const [reportedAt, setReportedAt] = React.useState<string>(() => toLocalInputValue(new Date()));
  const [lightsOn, setLightsOn] = React.useState(false);
  const [sirensOn, setSirensOn] = React.useState(false);
  const [selectedDirection, setSelectedDirection] = React.useState<Direction | null>(null);
  const [stationary, setStationary] = React.useState(false);
  const [vetMethod, setVetMethod] = React.useState<VetMethod | "">("");
  const [vetNotes, setVetNotes] = React.useState("");
  const [test, setTest] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  type LeafletPinMapProps = {
    center: [number, number];
    zoom: number;
    lat: number | null;
    lng: number | null;
    open: boolean;
    onSelect: (lat: number, lng: number) => void;
  };
  const [PinMap, setPinMap] = React.useState<React.ComponentType<LeafletPinMapProps> | null>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === 'undefined') return;
      try {
        const mod = await import("@workspace/ui/components/client/location/LeafletPinMap");
        if (mounted) setPinMap(() => mod.default);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const resetForm = React.useCallback(() => {
    setAgencyType([]);
    setAgencyOther("");
    setMediaUrl("");
    setLat(null);
    setLng(null);
    setLightsOn(false);
    setSirensOn(false);
    setSelectedDirection(null);
    setStationary(false);
    setVetMethod("");
    setVetNotes("");
    setTest(false);
    setReportedAt(toLocalInputValue(new Date()));
  }, []);

  const addAgencyType = (value: string) => setAgencyType((prev) => (prev.includes(value) ? prev : [...prev, value]));
  const removeAgencyType = (value: string) => setAgencyType((prev) => prev.filter((v) => v !== value));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (typeof lat !== "number" || typeof lng !== "number") {
      setError("Latitude and longitude must be numbers.");
      return;
    }

    const moving = stationary ? false : selectedDirection ? true : null;

    let timestampIso = new Date().toISOString();
    try {
      if (reportedAt) {
        const d = new Date(reportedAt);
        if (!isNaN(d.getTime())) timestampIso = d.toISOString();
      }
    } catch {}

    const payload: ConfirmedWatchPayload = {
      timestamp: timestampIso,
      agency_type: agencyType.length ? agencyType : null,
      agency_other: agencyOther || null,
      location: { lat, lng },
      media_url: mediaUrl || null,
      officer_moving: moving,
      officer_direction: selectedDirection || null,
      lights_on: lightsOn || null,
      sirens_on: sirensOn || null,
      vet_method: vetMethod ? (vetMethod as VetMethod) : null,
      vet_notes: vetNotes || null,
      submitted_by: submittedBy ?? undefined,
      test: !!test,
    };

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (supabaseUrl && supabaseAnonKey) {
        const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/wizard?select=*`;
        const ins = async (body: any) =>
          fetch(url, {
            method: "POST",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify([body]),
          });

        // Build DB payload with only columns that exist on public.wizard
        const dbPayload = {
          timestamp: payload.timestamp,
          agency_type: payload.agency_type,
          agency_other: payload.agency_other,
          location: payload.location,
          media_url: payload.media_url,
          vet_method: payload.vet_method,
          officer_moving: payload.officer_moving,
          officer_direction: payload.officer_direction,
          lights_on: payload.lights_on,
          sirens_on: payload.sirens_on,
          submitted_by: payload.submitted_by,
          test: payload.test,
        } as const;

        // Try insert including submitted_by; fallback to omitting if FK fails
        let res = await ins(dbPayload);
        if (!res.ok && payload.submitted_by) {
          try {
            const err = await res.json().catch(() => ({}));
            const msg = (err && (err.message || err.error)) || `${res.status} ${res.statusText}`;
            const isFk = typeof msg === "string" && /foreign key|constraint|uuid/i.test(msg);
            if (isFk) {
              const { submitted_by, ...rest } = dbPayload as any;
              res = await ins(rest);
            }
          } catch {}
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
      } else {
        throw new Error("Missing onSubmit handler or Supabase credentials");
      }
      setSuccess("Confirmed report submitted.");
      resetForm();
    } catch (e: any) {
      setError(e?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={className ? className : "max-w-2xl space-y-4"}>
      <h1 className="text-xl font-semibold">Confirmed Watch</h1>
      <p className="text-sm text-muted-foreground">Submit a vetted sighting from photo/video review.</p>
      {error && <div className="text-destructive text-sm">{error}</div>}
      {success && <div className="text-emerald-600 text-sm">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reported_at">Reported Date/Time</Label>
          <Input
            id="reported_at"
            type="datetime-local"
            value={reportedAt}
            onChange={(e) => setReportedAt(e.target.value)}
          />
          <div className="text-xs text-muted-foreground">Defaults to now; adjust if reporting a past event.</div>
        </div>
        <div className="space-y-2">
          <Label>Pin Location</Label>
          <div className="w-full rounded-md overflow-hidden border" style={{ height: 360, minHeight: 260 }}>
            {PinMap ? (
              <PinMap
                center={typeof lat === "number" && typeof lng === "number" ? [lat, lng] : [39.8283, -99.5795]}
                zoom={typeof lat === "number" && typeof lng === "number" ? 14 : 4}
                lat={lat}
                lng={lng}
                open={true}
                onSelect={(la: number, lo: number) => { setLat(la); setLng(lo); }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading map…</div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {typeof lat === "number" && typeof lng === "number" ? `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}` : "Click on the map to set a location"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Agency Type</Label>
            <Select onValueChange={(v) => addAgencyType(v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Add agency" /></SelectTrigger>
              <SelectContent>
                {AGENCY_OPTIONS.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
              </SelectContent>
            </Select>
            {agencyType.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {agencyType.map((t) => (
                  <span key={t} className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-white ${agencyColors[t] || agencyColors["Other"]}`}>
                    {t}
                    <button type="button" className="opacity-80 hover:opacity-100" onClick={() => removeAgencyType(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency_other">Agency Other</Label>
            <Input id="agency_other" value={agencyOther} onChange={(e) => setAgencyOther(e.target.value)} placeholder="Describe agency if other" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="media_url">Media URL</Label>
          <Input id="media_url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="vet_method">Vetting Method</Label>
            <Select value={vetMethod || undefined} onValueChange={(v) => setVetMethod(v as VetMethod)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="livestream">Live stream</SelectItem>
                <SelectItem value="dispatcher_network">Dispatcher network</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vet_notes">Vetting Notes</Label>
            <Textarea id="vet_notes" value={vetNotes} onChange={(e) => setVetNotes(e.target.value)} placeholder="Briefly describe how this was vetted" />
          </div>
        </div>

        <div className="space-y-4 flex flex-col md:flex-row md:items-center md:justify-evenly">
          <div className="space-y-2">
            <Label>Movement and Direction</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant={stationary ? "default" : "outline"} size="sm" onClick={() => { setStationary(true); setSelectedDirection(null); }}>Stationary</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setStationary(false); setSelectedDirection(null); }}>Clear</Button>
            </div>
            <div className="grid grid-cols-3 gap-2 w-fit">
              <Button type="button" variant={selectedDirection === "NorthWest" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("NorthWest"); }}>NW</Button>
              <Button type="button" variant={selectedDirection === "North" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("North"); }}>N</Button>
              <Button type="button" variant={selectedDirection === "NorthEast" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("NorthEast"); }}>NE</Button>
              <Button type="button" variant={selectedDirection === "West" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("West"); }}>W</Button>
              <span />
              <Button type="button" variant={selectedDirection === "East" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("East"); }}>E</Button>
              <Button type="button" variant={selectedDirection === "SouthWest" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("SouthWest"); }}>SW</Button>
              <Button type="button" variant={selectedDirection === "South" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("South"); }}>S</Button>
              <Button type="button" variant={selectedDirection === "SouthEast" ? "default" : "outline"} size="sm" onClick={() => { setStationary(false); setSelectedDirection("SouthEast"); }}>SE</Button>
            </div>
          </div>

          <div className="space-y-2 flex flex-col w-full md:w-auto">
            <label className="flex items-center justify-between gap-2 w-full"><span>Lights on</span><Switch checked={lightsOn} onCheckedChange={setLightsOn} /></label>
            <label className="flex items-center justify-between gap-2 w-full"><span>Sirens on</span><Switch checked={sirensOn} onCheckedChange={setSirensOn} /></label>
            <label className="flex items-center justify-between gap-2 w-full"><span>Mark as test report</span><Switch checked={test} onCheckedChange={setTest} /></label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit Confirmed Report"}</Button>
        </div>
      </form>
    </section>
  );
}

export default ConfirmedWatchForm;
