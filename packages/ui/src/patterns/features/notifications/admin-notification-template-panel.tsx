"use client";

import * as React from "react";
import { Label } from "@workspace/ui/primitives/label";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Button } from "@workspace/ui/primitives/button";
import {
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
  type NotificationLevel,
} from "@workspace/store/types/notifications";
import {
  type AdminNotificationTemplateDescriptor,
  type AdminNotificationTemplateKey,
} from "@workspace/store/admin/notifications/templates";
import { humanize } from "@workspace/ui/lib/utils";
import type { SendArgs } from "./admin-notification-form";

type AdminNotificationTemplatePanelProps = {
  templateOptions: AdminNotificationTemplateDescriptor[];
  onSend: (args: SendArgs) => Promise<boolean> | boolean;
};

export function AdminNotificationTemplatePanel({
  templateOptions,
  onSend,
}: AdminNotificationTemplatePanelProps) {
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<AdminNotificationTemplateKey | null>(null);
  const selectedOption = React.useMemo(
    () =>
      templateOptions.find((option) => option.value === selectedTemplate) ??
      null,
    [selectedTemplate, templateOptions]
  );
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftBody, setDraftBody] = React.useState("");
  const [draftLevel, setDraftLevel] = React.useState<NotificationLevel>("info");
  const [draftChannel, setDraftChannel] =
    React.useState<NotificationChannel>("system");
  const [draftLink, setDraftLink] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  React.useEffect(() => {
    if (!selectedOption) {
      setDraftTitle("");
      setDraftBody("");
      setDraftLevel("info");
      setDraftChannel("system");
      setDraftLink("");
      return;
    }
    setDraftTitle(selectedOption.defaults.title);
    setDraftBody(selectedOption.defaults.body);
    setDraftLevel(selectedOption.defaults.level);
    setDraftChannel(selectedOption.defaults.channel);
    setDraftLink(selectedOption.defaults.link ?? "");
  }, [selectedOption]);

  const handleSend = React.useCallback(async () => {
    if (!selectedOption) return;
    const title = draftTitle.trim();
    const body = draftBody.trim();
    if (!title || !body) return;
    setIsSending(true);
    try {
      await Promise.resolve(
        onSend({
          template: selectedOption.value,
          title,
          body,
          level: draftLevel,
          channel: draftChannel,
          link: draftLink.trim() ? draftLink.trim() : undefined,
        })
      );
    } finally {
      setIsSending(false);
    }
  }, [
    draftBody,
    draftChannel,
    draftLevel,
    draftLink,
    draftTitle,
    onSend,
    selectedOption,
  ]);

  if (!templateOptions.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:max-w-sm">
        <Label htmlFor="template-select">Template</Label>
        <Select
          value={selectedTemplate ?? undefined}
          onValueChange={(value) =>
            setSelectedTemplate(value as AdminNotificationTemplateKey)
          }
        >
          <SelectTrigger id="template-select">
            <SelectValue placeholder="Choose a template" />
          </SelectTrigger>
          <SelectContent>
            {templateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedOption ? (
        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-sm text-muted-foreground">
            {selectedOption.description}
          </p>
          <div className="grid gap-2">
            <Label htmlFor="template-title">Title</Label>
            <Input
              id="template-title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Subject/title of the notification"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-body">Body</Label>
            <Textarea
              id="template-body"
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              rows={4}
              placeholder="Message body"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="template-level">Level</Label>
              <Select
                value={draftLevel}
                onValueChange={(value) =>
                  setDraftLevel(value as NotificationLevel)
                }
              >
                <SelectTrigger id="template-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-channel">Channel</Label>
              <Select
                value={draftChannel}
                onValueChange={(value) =>
                  setDraftChannel(value as NotificationChannel)
                }
              >
                <SelectTrigger id="template-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {humanize(channel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-link">Link (optional)</Label>
              <Input
                id="template-link"
                value={draftLink}
                onChange={(event) => setDraftLink(event.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending || !draftTitle.trim() || !draftBody.trim()}
            >
              {isSending ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a template to preview and customize the notification before
          sending.
        </p>
      )}
    </div>
  );
}
