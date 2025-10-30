"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

type Props = {
  onLog?: (entry: { message: string; message_type: 'Routine' | 'Priority' | 'Emergency'; importance: 'Low' | 'Normal' | 'High' }) => void | Promise<void>;
};

const presets = [
  { id: 'consolidate', label: 'Consolidate ×3 + Location', template: (loc: string) => `Consolidate, Consolidate, Consolidate — ${loc}.` as const, type: 'Priority' as const, importance: 'High' as const },
  { id: 'break_fast', label: 'Break ×3 (fast) + Location', template: (loc: string) => `Break, Break, Break — ${loc}.` as const, type: 'Emergency' as const, importance: 'High' as const },
  { id: 'silence', label: 'Radio Silence + Reason', template: (loc: string) => `All stations, radio silence — ${loc}.` as const, type: 'Priority' as const, importance: 'High' as const },
];

export function CommsAlertsCard({ onLog }: Props) {
  const [location, setLocation] = React.useState('');

  const handleCopy = (text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error('Clipboard unavailable');
      return;
    }
    navigator.clipboard.writeText(text).then(() => toast.success('Alert copied')).catch(() => toast.error('Copy failed'));
  };

  const handlePreset = async (preset: typeof presets[number]) => {
    const text = preset.template(location || 'specify location');
    handleCopy(text);
    try {
      await onLog?.({ message: text, message_type: preset.type, importance: preset.importance });
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Etiquette</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2">
          <Label htmlFor="alert-location">Location/Context</Label>
          <Input id="alert-location" placeholder="e.g., Base, Trailhead, Sector Bravo" value={location} onChange={(e) => setLocation(e.target.value)} />
          <div className="flex flex-wrap gap-2 pt-1">
            {presets.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => handlePreset(p)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <p className="font-medium">Radio Etiquette (Quick Guide)</p>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            <li>Think, key, speak — concise and clear.</li>
            <li>Identify first: your callsign, then whom you’re calling.</li>
            <li>Say “Break” for urgent traffic; “Priority” for important.</li>
            <li>Use plain language; avoid codes unless standard.</li>
            <li>Confirm critical info with a read-back.</li>
            <li>Keep the channel clear during emergencies.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default CommsAlertsCard;

