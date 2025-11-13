import type { NotificationChannel, NotificationLevel } from '../../types/notifications';

export type AdminNotificationTemplateKey =
  | 'maintenance'
  | 'dispatch_surge'
  | 'academy_reminder'
  | 'welcome'
  | 'pod_invite'
  | 'credential_expiring'
  | 'dispatch_shift_gap'
  | 'watch_major_update'
  | 'resource_drive';

export type AdminNotificationTemplateDefaults = {
  title: string;
  body: string;
  level: NotificationLevel;
  channel: NotificationChannel;
  link?: string | null;
};

export type AdminNotificationTemplateDescriptor = {
  value: AdminNotificationTemplateKey;
  label: string;
  description: string;
  defaults: AdminNotificationTemplateDefaults;
};

export const ADMIN_NOTIFICATION_TEMPLATES: AdminNotificationTemplateDescriptor[] = [
  {
    value: 'maintenance',
    label: 'System Maintenance',
    description: 'Let your teams know about planned downtime so they can prepare ahead of time.',
    defaults: {
      title: 'System Maintenance Tonight',
      body: 'We will perform scheduled maintenance at 11pm local. Brief downtime expected.',
      level: 'warning',
      channel: 'system',
    },
  },
  {
    value: 'dispatch_surge',
    label: 'Dispatch Surge',
    description: 'Request additional dispatch coverage when incidents spike across the region.',
    defaults: {
      title: 'Dispatch Surge: Extra Coverage Needed',
      body: 'We are experiencing elevated reports. If available, please check the dashboard and join a shift.',
      level: 'info',
      channel: 'dispatch',
    },
  },
  {
    value: 'academy_reminder',
    label: 'Academy Reminder',
    description: 'Nudge members about upcoming trainings so they stay current with certifications.',
    defaults: {
      title: 'Academy: Upcoming Training Reminder',
      body: "Don't forget to RSVP for this week's dispatcher training session.",
      level: 'success',
      channel: 'academy',
    },
  },
  {
    value: 'welcome',
    label: 'Welcome Message',
    description: 'Share onboarding steps with new members joining the region.',
    defaults: {
      title: 'Welcome to the Region',
      body: 'Thanks for joining. Visit your profile to complete onboarding steps.',
      level: 'info',
      channel: 'system',
    },
  },
  {
    value: 'pod_invite',
    label: 'Pods: Join or Create',
    description: 'Encourage members to connect with a pod so they have a small team for support.',
    defaults: {
      title: 'Find Your Pod',
      body: 'Pods keep our region strong. Join an existing pod or create one in the pods dashboard to stay supported and connected.',
      level: 'success',
      channel: 'advocacy',
    },
  },
  {
    value: 'credential_expiring',
    label: 'Credentials Expiring',
    description: 'Remind members to renew certifications before they lapse and block their access.',
    defaults: {
      title: 'Action Needed: Certification Expiring',
      body: 'Our records show one or more certifications expiring soon. Visit the credential center to upload renewals before they lapse.',
      level: 'warning',
      channel: 'academy',
    },
  },
  {
    value: 'dispatch_shift_gap',
    label: 'Dispatch Shift Coverage',
    description: 'Alert dispatchers that upcoming shifts still need coverage so the schedule stays full.',
    defaults: {
      title: 'Dispatch Shift Coverage Needed',
      body: 'We have open dispatch shifts coming up. Check the schedule and claim a time slot if you can help cover.',
      level: 'warning',
      channel: 'dispatch',
    },
  },
  {
    value: 'watch_major_update',
    label: 'Watch: Major Update',
    description: 'Share urgent map or incident updates with watch volunteers monitoring activity.',
    defaults: {
      title: 'Watch Update: Action Recommended',
      body: 'A significant change just hit the watch dashboard. Review the incident details and coordinate any needed follow-up.',
      level: 'warning',
      channel: 'watch',
    },
  },
  {
    value: 'resource_drive',
    label: 'Advocacy Resource Drive',
    description: 'Promote an advocacy campaign or resource drive that needs support from members.',
    defaults: {
      title: 'Support Our Resource Drive',
      body: 'We are launching a new resource drive. Visit the advocacy hub to learn how you can contribute and spread the word.',
      level: 'success',
      channel: 'advocacy',
    },
  },
];

const ADMIN_NOTIFICATION_TEMPLATE_MAP: Record<AdminNotificationTemplateKey, AdminNotificationTemplateDescriptor> =
  ADMIN_NOTIFICATION_TEMPLATES.reduce(
    (acc, template) => ({ ...acc, [template.value]: template }),
    {} as Record<AdminNotificationTemplateKey, AdminNotificationTemplateDescriptor>,
  );

export function getAdminNotificationTemplate(
  value: AdminNotificationTemplateKey,
): AdminNotificationTemplateDescriptor | null {
  return ADMIN_NOTIFICATION_TEMPLATE_MAP[value] ?? null;
}

export function getAdminNotificationTemplateDefaults(
  value: AdminNotificationTemplateKey,
): AdminNotificationTemplateDefaults | null {
  const descriptor = getAdminNotificationTemplate(value);
  if (!descriptor) return null;
  return { ...descriptor.defaults };
}
