'use client';

import { useCallback, useEffect, useState } from 'react';
import { FormSectionCard } from '@workspace/ui/patterns/common/form-section-card';
import { Switch } from '@workspace/ui/primitives/switch';
import { toast } from '@workspace/ui/primitives/sonner';
import {
  disablePushNotifications,
  enablePushNotifications,
  getExistingSubscription,
  isPushSupported,
} from '@/components/push/usePushNotifications';

const hasVapidKey = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

export default function EnablePush() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const refreshState = useCallback(async () => {
    const nextSupported = isPushSupported();
    setSupported(nextSupported);
    if (!nextSupported) {
      setEnabled(false);
      setInitialized(true);
      return;
    }
    setPermission(Notification.permission);
    const existing = await getExistingSubscription();
    setEnabled(Boolean(existing));
    setInitialized(true);
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const handleToggle = useCallback(
    async (next: boolean) => {
      if (!supported || !hasVapidKey) return;
      setPending(true);
      try {
        if (next) {
          await enablePushNotifications();
          toast.success('Push notifications enabled on this device');
        } else {
          await disablePushNotifications();
          toast.success('Push notifications disabled on this device');
        }
      } catch (error: any) {
        toast.error('Unable to update push notifications', {
          description: error?.message ?? String(error),
        });
      } finally {
        await refreshState();
        setPending(false);
      }
    },
    [supported, refreshState],
  );

  const blocked = permission === 'denied';
  const checked = supported && enabled && permission === 'granted';
  const toggleDisabled = !supported || !hasVapidKey || blocked || pending || !initialized;

  let statusCopy = 'Enable push notifications to receive dispatch alerts even when the PWA is closed.';
  if (!initialized) statusCopy = 'Checking browser support...';
  else if (!supported) statusCopy = 'Push notifications are not supported in this browser.';
  else if (!hasVapidKey) statusCopy = 'Push notifications are not configured for this environment.';
  else if (blocked) statusCopy = 'Notifications are blocked in your browser settings.';

  return (
    <FormSectionCard
      title="Dispatch Push Alerts"
      description="Control push notifications for this browser."
      sectionName="Notifications"
      footerContent={null}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">Push notifications</div>
          <div className="text-sm text-muted-foreground">{statusCopy}</div>
        </div>
        <Switch checked={checked} disabled={toggleDisabled} onCheckedChange={handleToggle} />
      </div>
      <p className="text-xs text-muted-foreground">
        Requires the ART Dispatch PWA to be installed and a supported browser. Each device manages its own push
        enrollment.
      </p>
    </FormSectionCard>
  );
}
