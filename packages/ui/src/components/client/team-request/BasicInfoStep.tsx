"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { US_STATES } from "@workspace/ui/lib/constants/states";
import { humanize } from "@workspace/ui/lib/utils";
import { DispatchType } from "@workspace/store/types/dispatch.ts";
import { resolveLocationInfo } from "@workspace/ui/lib/location-resolver";
import { DateTimePicker } from "@workspace/ui/components/DateTimePicker";
import { usePreferencesStore } from "@workspace/store/usePreferencesStore";
import { kmToMi, miToKm } from "@workspace/ui/lib/distance";
import DistanceUnitToggle from "@workspace/ui/components/DistanceUnitToggle";

interface BasicInfoStepProps {
  initial?: {
    location_label?: string;
    type?: DispatchType;
    state?: string;
    visibility_radius_km?: number;
    location?: { lat: number; lng: number };
    date_of_event?: string;
  };
  onNext: (data: BasicInfoStepProps["initial"]) => void;
}

export function BasicInfoStep({ initial, onNext }: BasicInfoStepProps) {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const [locationLabel, setLocationLabel] = useState(initial?.location_label ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [type, setType] = useState<DispatchType>(initial?.type ?? "rapid_response");
  // Distance unit preference (persisted)
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const [radiusInput, setRadiusInput] = useState<number>(() => {
    const baseKm = initial?.visibility_radius_km != null ? initial.visibility_radius_km : 9.66;
    const v = unit === 'mi' ? kmToMi(baseKm) : baseKm;
    return round2(v);
  });
  const lastUnitRef = useRef(unit);
  useEffect(() => {
    if (unit !== lastUnitRef.current) {
      setRadiusInput((prev) => {
        // Convert previous value to km based on previous unit, then to the new unit
        const km = lastUnitRef.current === 'mi' ? miToKm(prev) : prev;
        const converted = unit === 'mi' ? kmToMi(km) : km;
        return Math.round(converted * 100) / 100;
      });
      lastUnitRef.current = unit;
    }
  }, [unit]);
  const [location] = useState(initial?.location);
  const [dateOfEvent, setDateOfEvent] = useState<string | undefined>(initial?.date_of_event ?? new Date().toISOString());
  const [resolvedOnce, setResolvedOnce] = useState(false);

  const stateLookup = useMemo(() => {
    const byName = new Map<string, string>();
    US_STATES.forEach((s) => {
      byName.set(s.name.toLowerCase(), s.code);
    });
    return byName;
  }, []);

  useEffect(() => {
    if (!location) return;
    if (typeof location.lat !== "number" || typeof location.lng !== "number") return;
    if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    if (resolvedOnce) return;

    let active = true;
    resolveLocationInfo(location.lat, location.lng).then((info) => {
      if (!active) return;

      const resolvedStateCode =
        info.stateCode && info.stateCode.length === 2
          ? info.stateCode.toUpperCase()
          : info.state
            ? stateLookup.get(info.state.toLowerCase())
            : undefined;
      const stateDisplay = resolvedStateCode ?? info.state ?? "";
      const resolvedLabel =
        info.city && stateDisplay
          ? `${info.city}, ${stateDisplay}`
          : info.city ?? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;

      setLocationLabel((prev) => {
        if (prev && prev.trim().length > 0 && prev !== initial?.location_label) {
          return prev;
        }
        return resolvedLabel;
      });

      setState((prev) => {
        if (prev && prev.length > 0) return prev;
        return resolvedStateCode ?? prev;
      });

      setResolvedOnce(true);
    });

    return () => {
      active = false;
    };
  }, [initial?.location_label, location, resolvedOnce, stateLookup]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Basic Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Location Label</Label>
          <Input
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="Mission District, SF"
          />
        </div>

        {location && (
          <div className="text-sm text-muted-foreground">
            Coordinates from pin: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        <div>
          <Label htmlFor="">
            Reponse Type
          </Label>
          <Select value={type} onValueChange={(v) => setType(v as DispatchType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select response type" />
            </SelectTrigger>
            <SelectContent>
              {["rapid_response", "planned_event", "training", "community_aid", "technical_aid", "other"].map((type) => (
                <SelectItem key={type} value={type}>
                  {humanize(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Event Date/Time</Label>
          <div className="mt-1">
            <DateTimePicker label="Date of Event" value={dateOfEvent} onChange={setDateOfEvent} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">For Planned Events, set in the future. Defaults to now.</p>
        </div>

        <div>
          <Label>State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Visibility Radius ({unit})</Label>
            <DistanceUnitToggle />
          </div>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={radiusInput}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              // Ensure we pass a number to the state setter (toFixed returns a string)
              setRadiusInput(Number.isNaN(val) ? 0 : Math.round(val * 100) / 100);
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be used to send notifications to users within that radius.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() =>
            onNext({
              location_label: locationLabel,
              type,
              state,
              visibility_radius_km: unit === 'mi' ? miToKm(radiusInput) : radiusInput,
              location,
              date_of_event: dateOfEvent,
            })
          }
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
