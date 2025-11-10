"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import AdminNotificationForm, {
  type SendArgs,
} from "@workspace/ui/components/admin/notifications/AdminNotificationForm";

async function sendNotification(args: SendArgs) {
  const res = await fetch("/api/admin/notifications/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{ id?: string; recipientsCount?: number }>;
}

export default function AdminNotificationsDataLayer() {
  const handleTemplate = React.useCallback(
    async (template: SendArgs["template"]) => {
      try {
        const { id, recipientsCount } = await sendNotification({ template });
        const suffix =
          typeof recipientsCount === "number"
            ? ` • ${recipientsCount} recipient${recipientsCount === 1 ? "" : "s"}`
            : "";
        toast.success("Notification sent", {
          description: `${id ? `id: ${id}` : ""}${suffix}`.trim(),
        });
      } catch (e: any) {
        toast.error("Failed to send notification", {
          description: e?.message ?? String(e),
        });
      }
    },
    [],
  );

  const handleCustom = React.useCallback(async (args: SendArgs) => {
    try {
      const { id, recipientsCount } = await sendNotification(args);
      const suffix =
        typeof recipientsCount === "number"
          ? ` • ${recipientsCount} recipient${recipientsCount === 1 ? "" : "s"}`
          : "";
      toast.success("Notification sent", {
        description: `${id ? `id: ${id}` : ""}${suffix}`.trim(),
      });
    } catch (e: any) {
      toast.error("Failed to send notification", {
        description: e?.message ?? String(e),
      });
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Send standard or custom notifications to your region
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="secondary"
            onClick={() => handleTemplate("maintenance")}
          >
            System Maintenance
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleTemplate("dispatch_surge")}
          >
            Dispatch Surge
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleTemplate("academy_reminder")}
          >
            Academy Reminder
          </Button>
          <Button variant="secondary" onClick={() => handleTemplate("welcome")}>
            Welcome Message
          </Button>
        </div>
        <hr className="my-2" />
        <AdminNotificationForm onSend={handleCustom} />
      </CardContent>
    </Card>
  );
}
