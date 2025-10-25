"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { RegionSettings } from "@workspace/store/types/global";

type Props = {
  initialSettings: RegionSettings;
};

export default function SettingsClient({ initialSettings }: Props) {
  const [values, setValues] = React.useState<RegionSettings>(initialSettings);

  function onChange<K extends keyof RegionSettings>(key: K, value: RegionSettings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function save() {
    // Demo-only: local state; wire to server action later
    toast.success("Settings saved — demo-only");
  }

  function reset() {
    setValues(initialSettings);
    toast.info("Reset to last saved");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Region Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update region metadata and defaults.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Region label">
            <Input value={values.regionLabel} onChange={(e) => onChange('regionLabel', e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Timezone">
              <Input value={values.timezone} onChange={(e) => onChange('timezone', e.target.value)} placeholder="e.g. America/Los_Angeles" />
            </Field>
            <Field label="Coordination zone">
              <Input value={values.coordination_zone} onChange={(e) => onChange('coordination_zone', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default dispatch radius (km)">
              <Input type="number" value={values.defaultDispatchRadiusKm} onChange={(e) => onChange('defaultDispatchRadiusKm', Number(e.target.value) || 0)} />
            </Field>
            <Field label="Cleanup interval (days)">
              <Input type="number" value={values.cleanupIntervalsDays} onChange={(e) => onChange('cleanupIntervalsDays', Number(e.target.value) || 0)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Signal and federation endpoints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Signal onboarding group">
            <Input value={values.integrationSignalGroup ?? ''} onChange={(e) => onChange('integrationSignalGroup', e.target.value)} placeholder="https://signal.group/#..." />
          </Field>
          <Field label="Federation endpoint">
            <Input value={values.federationEndpoint ?? ''} onChange={(e) => onChange('federationEndpoint', e.target.value)} placeholder="https://.../api" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Escalation Rules</CardTitle>
          <CardDescription>JSON or text rules governing promotions and approvals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={values.roleEscalationRules ?? ''} onChange={(e) => onChange('roleEscalationRules', e.target.value)} rows={8} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={reset}>Reset</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

