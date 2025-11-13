"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { toast } from "sonner";
import AdminNotificationForm, {
  type SendArgs,
} from "@workspace/ui/components/admin/notifications/AdminNotificationForm";
import {
  AdminNotificationTemplatePanel,
} from "@workspace/ui/components/admin/notifications/AdminNotificationTemplatePanel";
import { ADMIN_NOTIFICATION_TEMPLATES } from "@workspace/store/admin/notifications/templates";

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
      return true;
    } catch (e: any) {
      toast.error("Failed to send notification", {
        description: e?.message ?? String(e),
      });
      return false;
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
      <CardContent className="space-y-6">
        <AdminNotificationTemplatePanel
          templateOptions={ADMIN_NOTIFICATION_TEMPLATES}
          onSend={handleCustom}
        />
        <hr className="my-2" />
        <AdminNotificationForm onSend={handleCustom} />
      </CardContent>
    </Card>
  );
}
