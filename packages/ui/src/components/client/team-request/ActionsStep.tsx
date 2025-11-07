"use client";

import { useState } from "react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { ACTION_PRESETS_GROUPED } from "@workspace/store/types/roles.ts";
import { SelectableCard } from "@workspace/ui/components/SelectableCard";


interface ActionsStepProps {
  initial?: {
    intended_action_preset?: string;
    intended_actions?: string[];
    intended_action_notes?: string;
    intended_actions_custom?: string;
  };
  onBack: () => void;
  onNext: (data: ActionsStepProps["initial"]) => void;
}

export function ActionsStep({ initial, onBack, onNext }: ActionsStepProps) {
  const [preset, setPreset] = useState(initial?.intended_action_preset ?? "");
  const [actions, setActions] = useState<string[]>(initial?.intended_actions ?? []);
  const [notes, setNotes] = useState(initial?.intended_action_notes ?? "");
  const [custom, setCustom] = useState(initial?.intended_actions_custom ?? "");

  const toggleAction = (action: string) => {
    setActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Intended Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Object.entries(ACTION_PRESETS_GROUPED).map(([group, items]) => (
            <div key={group} className="space-y-2">
              <h4 className="font-semibold">{group}</h4>
              <div className="space-y-2">
                {items.map((action) => (
                  <SelectableCard
                    key={action}
                    label={action}
                    selected={actions.includes(action)}
                    onToggle={() => toggleAction(action)}
                    color="emerald"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="intended-notes">Notes</label>
          <Textarea
            id="intended-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add context or clarifications..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="custom-action">Custom Action</label>
          <Input
            id="custom-action"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Describe a custom plan..."
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() =>
            onNext({
              intended_action_preset: preset,
              intended_actions: actions,
              intended_action_notes: notes,
              intended_actions_custom: custom,
            })
          }
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
