"use client";

import { FormSectionCard } from "@workspace/ui/patterns/common/form-section-card";
import { Switch } from "@workspace/ui/primitives/switch";
import { Checkbox } from "@workspace/ui/primitives/checkbox";
import { Label } from "@workspace/ui/primitives/label";

export type ChannelKey = string;

export interface NotificationPrefsFormProps {
  loading?: boolean;
  saving?: boolean;
  channels: ChannelKey[];
  globalOptOut: boolean;
  muted: Record<ChannelKey, boolean>;
  onToggleReceive: (receive: boolean) => void;
  onToggleChannel: (channel: ChannelKey) => void;
  onSave: () => void;
}

export function NotificationPrefsForm({
  loading,
  saving,
  channels,
  globalOptOut,
  muted,
  onToggleReceive,
  onToggleChannel,
  onSave,
}: NotificationPrefsFormProps) {
  return (
    <FormSectionCard
      title="Notifications"
      description="Choose which notifications you want to receive. You can mute specific channels or opt out entirely."
      onSave={onSave}
      sectionName="Preferences"
      saveButtonProps={{ disabled: !!saving || !!loading }}
      contentClassName="grid gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Receive Notifications</div>
          <div className="text-sm text-muted-foreground">
            Disable to opt out globally
          </div>
        </div>
        <Switch
          checked={!globalOptOut}
          onCheckedChange={(v) => onToggleReceive(v)}
          disabled={loading}
        />
      </div>

      <div className="grid gap-3">
        <div className="text-sm font-medium">Mute Channels</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <label key={c} className="flex items-center gap-2">
              <Checkbox
                checked={!!muted[c]}
                onCheckedChange={() => onToggleChannel(c)}
                disabled={!!loading || globalOptOut}
              />
              <span className="capitalize">{c}</span>
            </label>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Muted channels will be hidden and will not trigger alerts.
        </div>
      </div>

      <div className="grid gap-3">
        <Label>Tip</Label>
        <p className="text-sm text-muted-foreground">
          Critical alerts are sent on the System channel. To stop all
          notifications, toggle off “Receive Notifications”.
        </p>
      </div>
    </FormSectionCard>
  );
}

export default NotificationPrefsForm;
