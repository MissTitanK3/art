"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";  // <-- add this
import { Label } from "@workspace/ui/components/label";
import { makeDispatchSubmission } from "@workspace/store/utils/generator";
import { toast } from "sonner";
import { humanize } from "@workspace/ui/lib/utils";
import { useState } from "react";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

interface ReviewStepProps {
  data: any;
  onBack: () => void;
  onReset: () => void;
  onSubmitted?: (submission: DispatchSubmission) => void;
  onCreateSubmission: (submission: DispatchSubmission) => void;
}

export function ReviewStep({ data, onBack, onReset, onSubmitted, onCreateSubmission }: ReviewStepProps) {
  // local state for toggle
  const [training, setTraining] = useState<boolean>(data.contact?.training ?? false);

  const handleSubmit = () => {
    const draft = makeDispatchSubmission({
      ...data.basicInfo,
      ...data.rolesNeeded,
      ...data.actions,
      ...data.contact,
      training, // override with toggle value
      ...(data.logisticsStep ?? {}),
    });

    onCreateSubmission(draft);

    toast.success("Dispatch request submitted", {
      description: "Your team request has been added to the Dispatch Board.",
    });

    onReset();
    onSubmitted?.(draft);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div>
          <h4 className="font-semibold">Basic Info</h4>
          <p>{data.basicInfo?.location_label} ({data.basicInfo?.state})</p>
          <p>Response type: {data.basicInfo?.type ? humanize(data.basicInfo.type) : "Rapid Response"}</p>
          <p>Visibility radius: {data.basicInfo?.visibility_radius_km} km</p>
          {data.basicInfo?.location && (
            <p className="text-sm text-muted-foreground">
              Coordinates: {data.basicInfo.location.lat.toFixed(4)}, {data.basicInfo.location.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Roles Needed */}
        <div>
          <h4 className="font-semibold">Roles Needed</h4>
          {data.rolesNeeded?.required_roles?.length ? (
            <ul className="list-disc pl-5">
              {data.rolesNeeded.required_roles.map((r: string) => (
                <li key={r}>
                  {humanize(r)} ({data.rolesNeeded.required_roles_by_type?.[r] ?? 1})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">None selected</p>
          )}
        </div>

        {/* Intended Actions */}
        <div>
          <h4 className="font-semibold">Intended Actions</h4>
          {data.actions?.intended_actions?.length ? (
            <ul className="list-disc pl-5">
              {data.actions.intended_actions.map((a: string) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">None selected</p>
          )}
          {data.actions?.intended_action_notes && (
            <p className="mt-2 italic">{data.actions.intended_action_notes}</p>
          )}
          {data.actions?.intended_actions_custom && (
            <p className="mt-2">Custom: {data.actions.intended_actions_custom}</p>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-blue-950 flex items-center justify-between">
          <Label
            htmlFor="training"
            className="text-lg font-semibold text-foreground"
          >
            Training Dispatch
          </Label>
          <Switch
            id="training"
            checked={training}
            onCheckedChange={setTraining}
            className="scale-125" // make switch bigger
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Submit Dispatch
        </Button>
      </CardFooter>
    </Card>
  );
}
