"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { US_STATES } from "@workspace/ui/lib/constants/states";
import { humanize } from "@workspace/ui/lib/utils";
import { DispatchType } from "@workspace/store/types/dispatch.ts";

interface BasicInfoStepProps {
  initial?: {
    location_label?: string;
    type?: DispatchType;
    state?: string;
    visibility_radius_km?: number;
  };
  onNext: (data: BasicInfoStepProps["initial"]) => void;
}

export function BasicInfoStep({ initial, onNext }: BasicInfoStepProps) {
  const [locationLabel, setLocationLabel] = useState(initial?.location_label ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [type, setType] = useState<DispatchType>(initial?.type ?? "rapid_response");
  const [radius, setRadius] = useState(initial?.visibility_radius_km ?? 10);

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
          <Label>Visibility Radius (km)</Label>
          <Input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() =>
            onNext({
              location_label: locationLabel,
              type,
              state,
              visibility_radius_km: radius,
            })
          }
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
